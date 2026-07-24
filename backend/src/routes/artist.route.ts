import { Router } from "express";
import {createArtist, getAllArtist, getArtistById, updateArtist, deleteArtist,} from "@/controllers/artist.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const router = Router();

// Public
router.get("/", getAllArtist);
router.get("/:id", getArtistById);

// Admin
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createArtist
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateArtist
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteArtist
);

export default router;