import prisma from "@/config/prisma";
import {
  ticketCategorySchema,
  TicketCategoryInput,
} from "@/validations/ticket-category.validation";

export const createTicketCategoryService = async (
  payload: TicketCategoryInput
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
  });

  return {
    statusCode: 201,
    success: true,
    message: "Kategori tiket berhasil dibuat",
    data: ticketCategory,
  };
};