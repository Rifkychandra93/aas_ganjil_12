import { Router } from "express";
import {
  createArtist,
  getAllArtist,
  getArtistById,
  updateArtist,
  deleteArtist,
} from "@/controllers/artist.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

router.get("/", getAllArtist);
router.get("/:id", getArtistById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  createArtist
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  updateArtist
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "SUPERADMIN"),
  deleteArtist
);

export default router;