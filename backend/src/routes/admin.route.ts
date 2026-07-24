import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {

    res.json({
      success: true,
      message: "Welcome Admin"
    });

  }
);

export default router;