import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { createOrderService, getMyOrdersService, getOrderByIdService, scanTicketService} from "@/services/order.service";

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  const result = await createOrderService(
    req.user!.id,
    req.body
  );

  res.status(result.statusCode).json(result);

};

export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {

  const result = await getMyOrdersService(
    req.user!.id
  );

  res.status(result.statusCode).json(result);

};

export const getOrderById = async (
  req: AuthRequest,
  res: Response
) => {

  const result = await getOrderByIdService(
    req.user!.id,
    req.params.id
  );

  res.status(result.statusCode).json(result);

};

export const scanTicket = async (
  req: AuthRequest,
  res: Response
) => {

  const result = await scanTicketService(req.body);

  res.status(result.statusCode).json(result);

};
