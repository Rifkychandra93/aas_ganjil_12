import prisma from "@/config/prisma";
import {
  ticketCategorySchema,
  TicketCategoryInput,
} from "@/validations/ticket-category.validation";
import { createSystemLog } from "./log.service";

export const getAllTicketCategoriesService = async () => {
  const categories = await prisma.ticketCategory.findMany({
    include: {
      event: {
        select: {
          id: true,
          title: true,
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
    data: categories,
  };
};

export const createTicketCategoryService = async (
  payload: TicketCategoryInput,
  actor?: { id: string; email: string; role: string }
) => {
  const validation = ticketCategorySchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { eventId, name, price, quota } = validation.data;

  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  const ticketCategory = await prisma.ticketCategory.create({
    data: {
      eventId,
      name,
      price,
      quota,
      remainingQuota: quota,
    },
    include: {
      event: true,
    },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Membuat Kategori Tiket: ${name} (${event.title})`,
      details: `Harga: Rp ${price.toLocaleString("id-ID")}, Kuota: ${quota}`,
    });
  }

  return {
    statusCode: 201,
    success: true,
    message: "Kategori tiket berhasil dibuat",
    data: ticketCategory,
  };
};

export const updateTicketCategoryService = async (
  id: string,
  payload: Partial<TicketCategoryInput>,
  actor?: { id: string; email: string; role: string }
) => {
  const existing = await prisma.ticketCategory.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!existing) {
    return {
      statusCode: 404,
      success: false,
      message: "Kategori tiket tidak ditemukan",
    };
  }

  const updated = await prisma.ticketCategory.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      price: payload.price ?? existing.price,
      quota: payload.quota ?? existing.quota,
      remainingQuota: payload.quota
        ? existing.remainingQuota + (payload.quota - existing.quota)
        : existing.remainingQuota,
    },
    include: { event: true },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Edit Kategori Tiket: ${updated.name}`,
      details: `Harga: Rp ${updated.price.toLocaleString("id-ID")}, Kuota: ${updated.quota}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Kategori tiket berhasil diupdate",
    data: updated,
  };
};

export const deleteTicketCategoryService = async (
  id: string,
  actor?: { id: string; email: string; role: string }
) => {
  const existing = await prisma.ticketCategory.findUnique({
    where: { id },
  });

  if (!existing) {
    return {
      statusCode: 404,
      success: false,
      message: "Kategori tiket tidak ditemukan",
    };
  }

  await prisma.ticketCategory.delete({
    where: { id },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Hapus Kategori Tiket: ${existing.name}`,
      details: `ID: ${id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Kategori tiket berhasil dihapus",
  };
};