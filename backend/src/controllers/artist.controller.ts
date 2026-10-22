import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import {
  createArtistService,
  getAllArtistService,
  getArtistByIdService,
  updateArtistService,
  deleteArtistService,
} from "@/services/artist.service";

export const createArtist = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await createArtistService(req.body, actor);
  res.status(result.statusCode).json(result);
};

export const getAllArtist = async (_req: any, res: Response) => {
  const result = await getAllArtistService();
  res.status(result.statusCode).json(result);
};

export const getArtistById = async (req: any, res: Response) => {
  const result = await getArtistByIdService(req.params.id as string);
  res.status(result.statusCode).json(result);
};

export const updateArtist = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await updateArtistService(req.params.id as string, req.body, actor);
  res.status(result.statusCode).json(result);
};

export const deleteArtist = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await deleteArtistService(req.params.id as string, actor);
  res.status(result.statusCode).json(result);
};