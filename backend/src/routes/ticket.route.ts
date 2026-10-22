import { Router } from "express";
import { createTicket } from "@/controllers/ticket.controller";
import { getMyOrders, scanTicket } from "@/controllers/order.controller";
import { getAllTicketCategories } from "@/controllers/ticket-category.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", getAllTicketCategories);
router.get("/my", authMiddleware, getMyOrders);
router.post(
  "/scan",
  authMiddleware,
  roleMiddleware("GUARD", "ADMIN", "SUPERADMIN"),
  scanTicket
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  createTicket
);

export default router;