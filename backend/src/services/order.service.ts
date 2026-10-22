import prisma from "@/config/prisma";
import { generateTicketCode } from "@/utils/generate-ticket-code";
import { generateQRCodeDataUrl, generateBarcode128Svg } from "@/utils/generate-barcode";
import { createMidtransSnapTransaction } from "./midtrans.service";
import { sendTicketReceiptMail } from "./mail.service";
import { createSystemLog } from "./log.service";
import { PaymentMethod } from "@prisma/client";

export const createOrderService = async (
  userId: string,
  payload: any
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User tidak ditemukan",
    };
  }

  let itemsPayload: { ticketCategoryId: string; quantity: number }[] = [];

  if (payload.categoryId && payload.quantity) {
    itemsPayload = [
      {
        ticketCategoryId: String(payload.categoryId),
        quantity: Number(payload.quantity),
      },
    ];
  } else if (Array.isArray(payload.items) && payload.items.length > 0) {
    itemsPayload = payload.items.map((i: any) => ({
      ticketCategoryId: String(i.ticketCategoryId),
      quantity: Number(i.quantity),
    }));
  } else {
    return {
      statusCode: 400,
      success: false,
      message: "Data pemesanan tiket tidak valid",
    };
  }

  let totalPrice = 0;
  const ticketData: {
    ticket: any;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const item of itemsPayload) {
    const ticket = await prisma.ticketCategory.findUnique({
      where: { id: item.ticketCategoryId },
      include: { event: true },
    });

    if (!ticket) {
      return {
        statusCode: 404,
        success: false,
        message: "Kategori tiket tidak ditemukan",
      };
    }

    if (ticket.remainingQuota < item.quantity) {
      return {
        statusCode: 400,
        success: false,
        message: `Sisa tiket ${ticket.name} tidak mencukupi`,
      };
    }

    const subtotal = ticket.price * item.quantity;
    totalPrice += subtotal;
    ticketData.push({
      ticket,
      quantity: item.quantity,
      subtotal,
    });
  }

  const ticketCode = generateTicketCode();
  const qrCodeDataUrl = await generateQRCodeDataUrl(ticketCode);
  const barcodeSvgDataUrl = generateBarcode128Svg(ticketCode);

  const midtransItems = ticketData.map((td) => ({
    id: td.ticket.id,
    price: td.ticket.price,
    quantity: td.quantity,
    name: `${td.ticket.event?.title || "Event"} - ${td.ticket.name}`,
  }));

  const midtransResult = await createMidtransSnapTransaction({
    orderId: ticketCode,
    grossAmount: totalPrice,
    customerDetails: {
      firstName: user.name,
      email: user.email,
    },
    items: midtransItems,
  });

  const paymentMethodEnum: PaymentMethod =
    payload.paymentMethod && Object.values(PaymentMethod).includes(payload.paymentMethod)
      ? payload.paymentMethod
      : PaymentMethod.MIDTRANS;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        ticketCode,
        paymentMethod: paymentMethodEnum,
        totalPrice,
        status: "PAID",
        paidAt: new Date(),
        qrCode: qrCodeDataUrl,
        barcode: barcodeSvgDataUrl,
        snapToken: midtransResult.snapToken,
      },
    });

    for (const item of ticketData) {
      await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          ticketCategoryId: item.ticket.id,
          quantity: item.quantity,
          price: item.ticket.price,
          subtotal: item.subtotal,
        },
      });

      await tx.ticketCategory.update({
        where: { id: item.ticket.id },
        data: {
          remainingQuota: {
            decrement: item.quantity,
          },
        },
      });
    }

    return createdOrder;
  });

  const eventTitle = ticketData[0]?.ticket?.event?.title || "Konser Musik";
  await sendTicketReceiptMail(
    user.email,
    user.name,
    eventTitle,
    ticketCode,
    qrCodeDataUrl
  );

  await createSystemLog({
    userId: user.id,
    userEmail: user.email,
    role: user.role,
    action: `Pemesanan Tiket: ${eventTitle} (${ticketCode})`,
    details: `Total: Rp ${totalPrice.toLocaleString("id-ID")}`,
  });

  const result = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: {
        include: {
          ticketCategory: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  });

  return {
    statusCode: 201,
    success: true,
    message: "Order berhasil dibuat",
    snapToken: midtransResult.snapToken,
    redirectUrl: midtransResult.redirectUrl,
    data: {
      ...result,
      snapToken: midtransResult.snapToken,
      redirectUrl: midtransResult.redirectUrl,
    },
  };
};

export const getMyOrdersService = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          ticketCategory: {
            include: {
              event: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedTickets = orders.map((order) => {
    const firstItem = order.items[0];
    const event = firstItem?.ticketCategory?.event;
    const category = firstItem?.ticketCategory;

    return {
      id: order.id,
      orderId: order.id,
      ticketCode: order.ticketCode,
      eventTitle: event?.title || "Konser Musik",
      categoryName: category?.name || "Standard",
      qrCode: order.qrCode || "",
      barcode: order.barcode || "",
      isUsed: !!order.usedAt,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    };
  });

  return {
    statusCode: 200,
    success: true,
    data: formattedTickets,
  };
};

export const scanTicketService = async (
  payload: any,
  actor?: { id: string; email: string; role: string }
) => {
  const searchCode = payload.qrCode || payload.ticketCode;

  if (!searchCode) {
    return {
      statusCode: 400,
      success: false,
      message: "Kode QR / Barcode tiket wajib diisi",
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { ticketCode: searchCode },
        { id: searchCode },
      ],
    },
    include: {
      user: true,
      items: {
        include: {
          ticketCategory: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    if (actor) {
      await createSystemLog({
        userId: actor.id,
        userEmail: actor.email,
        role: actor.role,
        action: `Scan Tiket #${searchCode} (Tidak Ditemukan)`,
      });
    }
    return {
      statusCode: 404,
      success: false,
      message: "Tiket Tidak Valid / Tidak Ditemukan!",
    };
  }

  if (order.usedAt) {
    if (actor) {
      await createSystemLog({
        userId: actor.id,
        userEmail: actor.email,
        role: actor.role,
        action: `Scan Tiket #${order.ticketCode} (Sudah Digunakan)`,
      });
    }
    return {
      statusCode: 400,
      success: false,
      message: "Tiket Sudah Digunakan!",
    };
  }

  if (order.status !== "PAID") {
    return {
      statusCode: 400,
      success: false,
      message: "Status pembayaran tiket belum selesai",
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      usedAt: new Date(),
      status: "USED",
    },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Scan Tiket #${order.ticketCode} (Valid)`,
      details: `Customer: ${order.user.name}, Event: ${order.items[0]?.ticketCategory?.event?.title || "-"}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Tiket Valid! Silakan Masuk.",
    data: {
      ticketCode: order.ticketCode,
      customer: order.user.name,
      event: order.items[0]?.ticketCategory?.event?.title || "Konser Musik",
      category: order.items[0]?.ticketCategory?.name || "Reguler",
      usedAt: new Date(),
    },
  };
};

export const getOrderByIdService = async (
  userId: string,
  orderId: string
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          ticketCategory: {
            include: {
              event: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return {
      statusCode: 404,
      success: false,
      message: "Order tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    success: true,
    data: order,
  };
};