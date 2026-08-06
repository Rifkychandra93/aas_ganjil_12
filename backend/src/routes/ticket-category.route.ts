import { Router } from "express";
import { createTicketCategory } from "@/controllers/ticket-category.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

/**
 * @swagger
 * /ticket-categories:
 *   post:
 *     tags:
 *       - Ticket Category
 *     summary: Create Ticket Category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Ticket category created
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createTicketCategory
);

export default router;