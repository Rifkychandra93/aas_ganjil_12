import prisma from "@/config/prisma";
import { OrderInput, orderSchema } from "@/validations/order.validation";
import { generateTicketCode } from "@/utils/generate-ticket-code";
import { generateQRCode } from "@/utils/generate-qrcode";
import { TicketCategory } from "@prisma/client";

export const createOrderService = async (
  userId: string,
  payload: OrderInput
) => {

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User tidak ditemukan",
    };
  }

  const validation = orderSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { paymentMethod, items } = validation.data;

  let totalPrice = 0;

  const ticketData: {
    ticket: TicketCategory;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const item of items) {

    const ticket = await prisma.ticketCategory.findUnique({
      where: {
        id: item.ticketCategoryId,
      },
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
        message: `${ticket.name} tidak mencukupi`,
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

  const order = await prisma.$transaction(async (tx) => {

    const createdOrder = await tx.order.create({
      data: {
        userId,
        ticketCode,
        paymentMethod,
        totalPrice,
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
        where: {
          id: item.ticket.id,
        },
        data: {
          remainingQuota: {
            decrement: item.quantity,
          },
        },
      });

    }

    return createdOrder;

  });

  const result = await prisma.order.findUnique({
  where: {
    id: order.id,
  },
  include: {
    items: {
      include: {
        ticketCategory: true,
      },
    },
  },
});

return {
  statusCode: 201,
  success: true,
  message: "Order berhasil dibuat",
  data: result,
};

};

export const getMyOrdersService = async (
  userId: string
) => {

  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          ticketCategory: {
            include: {
              event: {
                include: {
                  artist: {
                    select: {
                      id: true,
                      name: true,
                      photo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    statusCode: 200,
    success: true,
    data: orders,
  };
};

export const cancelOrderService = async (
  userId: string,
  orderId: string
) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    return {
      statusCode: 404,
      success: false,
      message: "Order tidak ditemukan",
    };
  }

  if (order.userId !== userId) {
    return {
      statusCode: 403,
      success: false,
      message: "Anda tidak memiliki akses untuk membatalkan order ini",
    };
  }

  const updated = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "Order berhasil dibatalkan",
    data: updated,
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

import { scanSchema, ScanInput } from "@/validations/scan.validation";

export const scanTicketService = async (
  payload: ScanInput
) => {

  const validation = scanSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { ticketCode } = validation.data;

  const order = await prisma.order.findUnique({
    where: {
      ticketCode,
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
    return {
      statusCode: 404,
      success: false,
      message: "Tiket tidak ditemukan",
    };
  }

  if (order.status !== "PAID") {
    return {
      statusCode: 400,
      success: false,
      message: "Pembayaran belum disetujui",
    };
  }

  if (order.usedAt) {
    return {
      statusCode: 400,
      success: false,
      message: "Tiket sudah digunakan",
    };
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      usedAt: new Date(),
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "Tiket valid",
    data: {
      ticketCode: order.ticketCode,
      customer: order.user.name,
      event: order.items[0]?.ticketCategory.event.title,
    },
  };
};