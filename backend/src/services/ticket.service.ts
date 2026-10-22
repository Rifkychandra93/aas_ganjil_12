import prisma from "@/config/prisma";
import { ticketSchema, TicketInput } from "@/validations/ticket.validation";

export const createTicketService = async (
  payload: TicketInput
) => {
  const validation = ticketSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const { eventId, name, price, stock } = validation.data;

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

  const ticket = await prisma.ticketCategory.create({
    data: {
      eventId,
      name,
      price,
      quota: stock,
      remainingQuota: stock,
    },
  });

  return {
    statusCode: 201,
    success: true,
    message: "Kategori tiket berhasil dibuat",
    data: ticket,
  };
};