import prisma from "@/config/prisma";
import { createSystemLog } from "./log.service";

export const createEventService = async (
  payload: any,
  actor?: { id: string; email: string; role: string }
) => {
  const title = payload.title;
  const description = payload.description || "Deskripsi event";
  const location = payload.location;
  const dateInput = payload.eventDate || payload.date || new Date().toISOString();
  const poster = payload.poster || payload.imageUrl || null;
  let artistId = payload.artistId;

  if (!title || !location) {
    return {
      statusCode: 400,
      success: false,
      message: "Judul dan lokasi event wajib diisi",
    };
  }

  if (!artistId) {
    let defaultArtist = await prisma.artist.findFirst();
    if (!defaultArtist) {
      defaultArtist = await prisma.artist.create({
        data: {
          name: "Main Performer",
          description: "Artis Konser",
        },
      });
    }
    artistId = defaultArtist.id;
  }

  const parsedDate = new Date(dateInput);

  const event = await prisma.event.create({
    data: {
      artistId,
      title,
      description,
      location,
      poster,
      eventDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
    },
    include: {
      artist: true,
      ticketTypes: true,
    },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Menambahkan Event Baru: ${title}`,
      details: `Lokasi: ${location}, Tanggal: ${event.eventDate.toISOString()}`,
    });
  }

  return {
    statusCode: 201,
    success: true,
    message: "Event berhasil dibuat",
    data: {
      ...event,
      date: event.eventDate.toISOString(),
      imageUrl: event.poster,
      ticketCategories: event.ticketTypes,
    },
  };
};

export const getAllEventService = async () => {
  const events = await prisma.event.findMany({
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          quota: true,
          remainingQuota: true,
        },
      },
    },
    orderBy: {
      eventDate: "asc",
    },
  });

  const formattedEvents = events.map((event) => ({
    ...event,
    date: event.eventDate.toISOString(),
    imageUrl: event.poster || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80",
    ticketCategories: event.ticketTypes.map((t) => ({
      ...t,
      quota: t.remainingQuota,
    })),
  }));

  return {
    statusCode: 200,
    success: true,
    data: formattedEvents,
  };
};

export const getEventByIdService = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          photo: true,
        },
      },
      ticketTypes: {
        select: {
          id: true,
          name: true,
          price: true,
          quota: true,
          remainingQuota: true,
        },
      },
    },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  const formatted = {
    ...event,
    date: event.eventDate.toISOString(),
    imageUrl: event.poster || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80",
    ticketCategories: event.ticketTypes.map((t) => ({
      ...t,
      quota: t.remainingQuota,
    })),
  };

  return {
    statusCode: 200,
    success: true,
    data: formatted,
  };
};

export const updateEventService = async (
  id: string,
  payload: any,
  actor?: { id: string; email: string; role: string }
) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: payload.title ?? event.title,
      description: payload.description ?? event.description,
      location: payload.location ?? event.location,
      poster: payload.poster ?? payload.imageUrl ?? event.poster,
      eventDate: payload.eventDate || payload.date ? new Date(payload.eventDate || payload.date) : event.eventDate,
      artistId: payload.artistId ?? event.artistId,
    },
    include: {
      artist: true,
      ticketTypes: true,
    },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Edit Event: ${updated.title}`,
      details: `ID: ${id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Event berhasil diupdate",
    data: {
      ...updated,
      date: updated.eventDate.toISOString(),
      imageUrl: updated.poster,
      ticketCategories: updated.ticketTypes,
    },
  };
};

export const deleteEventService = async (
  id: string,
  actor?: { id: string; email: string; role: string }
) => {
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    return {
      statusCode: 404,
      success: false,
      message: "Event tidak ditemukan",
    };
  }

  await prisma.event.delete({
    where: { id },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Hapus Event: ${event.title}`,
      details: `ID: ${id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Event berhasil dihapus",
  };
};