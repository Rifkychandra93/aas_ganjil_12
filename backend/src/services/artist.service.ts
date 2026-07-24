import prisma from "@/config/prisma";
import {
  artistSchema,
  ArtistInput
} from "@/validations/artist.validation";

export const createArtistService = async (
  payload: ArtistInput
) => {

  const validation = artistSchema.safeParse(payload);

  if (!validation.success) {
    return {
      statusCode: 400,
      success: false,
      message: validation.error.issues[0].message
    };
  }

  const artist = await prisma.artist.create({
    data: validation.data
  });

  return {
    statusCode: 201,
    success: true,
    message: "Artist berhasil dibuat",
    data: artist
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
      where: {
        id,
      },
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
    payload: ArtistInput
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
  
    return {
      statusCode: 200,
      success: true,
      message: "Artist berhasil diupdate",
      data: updatedArtist,
    };
  };

  export const deleteArtistService = async (id: string) => {
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
  
    return {
      statusCode: 200,
      success: true,
      message: "Artist berhasil dihapus",
    };
  };