import { Router } from "express";
import { getAllUsers, inviteUser, deleteUser } from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("SUPERADMIN"), getAllUsers);
router.post("/invite", authMiddleware, roleMiddleware("SUPERADMIN"), inviteUser);
router.delete("/:id", authMiddleware, roleMiddleware("SUPERADMIN"), deleteUser);

export default router;
