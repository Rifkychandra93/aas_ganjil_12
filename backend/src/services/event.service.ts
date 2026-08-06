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

export const getAllEventService = async () => {
  const events = await prisma.event.findMany({
    where: {
      status: "OPEN"
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          photo: true
        }
      },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          remainingQuota: true
        }
      }
    },
    orderBy: {
      eventDate: "asc",
    },
  });

  return {
    statusCode: 200,
    success: true,
    data: events,
  };
};

export const getEventByIdService = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
      status: "OPEN"
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          photo: true
        }
      },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          remainingQuota: true
        }
      }
    },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    success: true,
    data: event,
  };
};

export const updateEventService = async (
  id: string,
  payload: EventInput
) => {
  const validation = eventSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  const updated = await prisma.event.update({
    where: {
      id,
    },
    data: {
      ...validation.data,
      eventDate: new Date(validation.data.eventDate),
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: "Event berhasil diupdate",
    data: updated,
  };
};

export const deleteEventService = async (id: string) => { 
  const event = await prisma.event.findUnique({ 
    where: { 
      id,
     },
    }); 
    
    if (!event) { 
      return {
         statusCode: 404, 
         success: false, 
         message: "Event tidak ditemukan", 
        }; 
    } 
    await prisma.event.delete({ 
      where: { 
        id, 
      }, 
    }); 
    return { 
      statusCode: 200, 
      success: true, 
      message: "Event berhasil dihapus", 
    }; 
};