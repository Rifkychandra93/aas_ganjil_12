import { Router } from "express";
import {
  createEvent,
  getAllEvent,
  getEventById,
  updateEvent,
  deleteEvent,
} from "@/controllers/event.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", getAllEvent);
router.get("/:id", getEventById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  createEvent
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  updateEvent
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  deleteEvent
);

export default router;