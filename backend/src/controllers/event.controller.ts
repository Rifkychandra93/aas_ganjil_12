import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import {
  createEventService,
  getAllEventService,
  getEventByIdService,
  updateEventService,
  deleteEventService,
} from "@/services/event.service";

export const createEvent = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await createEventService(req.body, actor);
  res.status(result.statusCode).json(result);
};

export const getAllEvent = async (_req: any, res: Response) => {
  const result = await getAllEventService();
  res.status(result.statusCode).json(result);
};

export const getEventById = async (req: any, res: Response) => {
  const result = await getEventByIdService(req.params.id as string);
  res.status(result.statusCode).json(result);
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await updateEventService(req.params.id as string, req.body, actor);
  res.status(result.statusCode).json(result);
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await deleteEventService(req.params.id as string, actor);
  res.status(result.statusCode).json(result);
};