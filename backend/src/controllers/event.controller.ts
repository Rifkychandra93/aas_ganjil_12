import { Request, Response } from "express";
import {
  createEventService,
  getAllEventService,
  getEventByIdService,
  updateEventService,
  deleteEventService,
} from "@/services/event.service";

export const createEvent = async (req: Request, res: Response) => {
  const result = await createEventService(req.body);

  res.status(result.statusCode).json(result);
};

export const getAllEvent = async (req: Request, res: Response) => {
  const result = await getAllEventService();

  res.status(result.statusCode).json(result);
};

export const getEventById = async (req: Request, res: Response) => {
  const result = await getEventByIdService(req.params.id as string);

  res.status(result.statusCode).json(result);
};

export const updateEvent = async (req: Request, res: Response) => {
  const result = await updateEventService(req.params.id as string, req.body);

  res.status(result.statusCode).json(result);
};

export const deleteEvent = async (req: Request, res: Response) => {
  const result = await deleteEventService(req.params.id as string);

  res.status(result.statusCode).json(result);
};