import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import {
  getAllTicketCategoriesService,
  createTicketCategoryService,
  updateTicketCategoryService,
  deleteTicketCategoryService,
} from "@/services/ticket-category.service";

export const getAllTicketCategories = async (_req: AuthRequest, res: Response) => {
  const result = await getAllTicketCategoriesService();
  res.status(result.statusCode).json(result);
};

export const createTicketCategory = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await createTicketCategoryService(req.body, actor);
  res.status(result.statusCode).json(result);
};

export const updateTicketCategory = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await updateTicketCategoryService(req.params.id as string, req.body, actor);
  res.status(result.statusCode).json(result);
};

export const deleteTicketCategory = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "admin@mail.com", role: req.user.role }
    : undefined;
  const result = await deleteTicketCategoryService(req.params.id as string, actor);
  res.status(result.statusCode).json(result);
};