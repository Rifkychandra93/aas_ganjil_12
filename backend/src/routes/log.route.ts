import { Router } from "express";
import { getSystemLogs } from "@/controllers/log.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("SUPERADMIN", "ADMIN"), getSystemLogs);

export default router;
