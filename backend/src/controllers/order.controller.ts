import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  scanTicketService,
} from "@/services/order.service";

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = await createOrderService(req.user!.id, req.body);
  res.status(result.statusCode).json(result);
};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await getMyOrdersService(req.user!.id);
  res.status(result.statusCode).json(result);
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response
) => {
  const result = await getOrderByIdService(req.user!.id, req.params.id as string);
  res.status(result.statusCode).json(result);
};

export const scanTicket = async (
  req: AuthRequest,
  res: Response
) => {
  const actor = req.user
    ? { id: req.user.id, email: req.user.email || "guard@mail.com", role: req.user.role }
    : undefined;
  const result = await scanTicketService(req.body, actor);
  res.status(result.statusCode).json(result);
};
