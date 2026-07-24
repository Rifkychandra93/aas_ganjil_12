import { Request, Response } from "express";
import { loginService, registerService } from "@/services/auth.service";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await registerService(req.body);

  res.status(result.statusCode).json(result);
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await loginService(req.body);

  res.status(result.statusCode).json(result);
};