import prisma from "@/config/prisma";
import { artistSchema, ArtistInput } from "@/validations/artist.validation";
import { createSystemLog } from "./log.service";

export const createArtistService = async (
  payload: ArtistInput,
  actor?: { id: string; email: string; role: string }
) => {
  const validation = artistSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const artist = await prisma.artist.create({
    data: validation.data,
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Menambahkan Artist Baru: ${artist.name}`,
      details: artist.description || undefined,
    });
  }

  return {
    statusCode: 201,
    success: true,
    message: "Artist berhasil dibuat",
    data: artist,
  };
};

export const getAllArtistService = async () => {
  const artists = await prisma.artist.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    statusCode: 200,
    success: true,
    data: artists,
  };
};

export const getArtistByIdService = async (id: string) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
  });

  if (!artist) {
    return {
      statusCode: 404,
      success: false,
      message: "Artist tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    success: true,
    data: artist,
  };
};

export const updateArtistService = async (
  id: string,
  payload: ArtistInput,
  actor?: { id: string; email: string; role: string }
) => {
  const validation = artistSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message,
    };
  }

  const artist = await prisma.artist.findUnique({
    where: { id },
  });

  if (!artist) {
    return {
      statusCode: 404,
      success: false,
      message: "Artist tidak ditemukan",
    };
  }

  const updatedArtist = await prisma.artist.update({
    where: { id },
    data: validation.data,
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Edit Artist: ${updatedArtist.name}`,
      details: `ID: ${id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Artist berhasil diupdate",
    data: updatedArtist,
  };
};

export const deleteArtistService = async (
  id: string,
  actor?: { id: string; email: string; role: string }
) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
  });

  if (!artist) {
    return {
      statusCode: 404,
      success: false,
      message: "Artist tidak ditemukan",
    };
  }

  await prisma.artist.delete({
    where: { id },
  });

  if (actor) {
    await createSystemLog({
      userId: actor.id,
      userEmail: actor.email,
      role: actor.role,
      action: `Hapus Artist: ${artist.name}`,
      details: `ID: ${id}`,
    });
  }

  return {
    statusCode: 200,
    success: true,
    message: "Artist berhasil dihapus",
  };
};