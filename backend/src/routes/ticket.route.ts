import { Router } from "express";
import { createTicket } from "@/controllers/ticket.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createTicket
);

export default router;