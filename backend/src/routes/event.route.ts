import { Router } from "express";
import { createEvent } from "@/controllers/event.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createEvent
);

export default router;