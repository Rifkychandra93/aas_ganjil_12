import { Response } from "express";
import { AuthRequest } from "@/middlewares/auth.middleware";
import {
  getAllUsersService,
  inviteUserService,
  deleteUserService,
} from "@/services/user.service";

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  const result = await getAllUsersService();
  res.status(result.statusCode).json(result);
};

export const inviteUser = async (req: AuthRequest, res: Response) => {
  const { email, role } = req.body;
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "superadmin@mail.com", role: req.user.role }
    : undefined;

  const result = await inviteUserService(email, role, actor);
  res.status(result.statusCode).json(result);
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const actor = req.user
    ? { id: req.user.id, email: (req.user as any).email || "superadmin@mail.com", role: req.user.role }
    : undefined;

  const result = await deleteUserService(req.params.id as string, actor);
  res.status(result.statusCode).json(result);
};
