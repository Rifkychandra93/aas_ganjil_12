import { Router } from "express";
import {
  getAllTicketCategories,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
} from "@/controllers/ticket-category.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", getAllTicketCategories);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  createTicketCategory
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  updateTicketCategory
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  deleteTicketCategory
);

export default router;