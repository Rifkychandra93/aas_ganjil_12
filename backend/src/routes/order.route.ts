import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  scanTicket,
} from "@/controllers/order.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/me", authMiddleware, getMyOrders);
router.get("/my", authMiddleware, getMyOrders);
router.post(
  "/scan",
  authMiddleware,
  roleMiddleware("GUARD", "ADMIN", "SUPERADMIN"),
  scanTicket
);
router.get("/:id", authMiddleware, getOrderById);

export default router;