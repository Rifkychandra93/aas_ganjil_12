import prisma from "@/config/prisma";
import { eventSchema, EventInput } from "@/validations/event.validation";

export const createEventService = async (
  payload: EventInput
) => {

  const validation = eventSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message
    };
  }

  const {
    artistId,
    title,
    description,
    location,
    eventDate
  } = validation.data;

  const artist = await prisma.artist.findUnique({
    where: {
      id: artistId
    }
  });

  if (!artist) {
    return {
      statusCode: 404,
      success: false,
      message: "Artist tidak ditemukan"
    };
  }

  const event = await prisma.event.create({
    data: {
      artistId,
      title,
      description,
      location,
      eventDate: new Date(eventDate)
    }
  });

  return {
    statusCode: 201,
    success: true,
    message: "Event berhasil dibuat",
    data: event
  };

};