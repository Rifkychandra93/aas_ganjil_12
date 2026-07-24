import { Request, Response } from "express";
import { createEventService } from "@/services/event.service";

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {

  const result = await createEventService(req.body);

  res.status(result.statusCode).json(result);

};