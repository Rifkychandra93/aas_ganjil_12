import { Request, Response } from "express";
import { createTicketCategoryService } from "@/services/ticket-category.service";

export const createTicketCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await createTicketCategoryService(req.body);

  res.status(result.statusCode).json(result);
};