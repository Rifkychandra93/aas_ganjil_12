import { Router } from "express";
import { dashboard } from "@/controllers/admin.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  dashboard
);

export default router;