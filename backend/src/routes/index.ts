import { Router } from "express";
import authRoute from "./auth.route";
import adminRoute from "./admin.route";
import artistRoute from "./artist.route";
import eventRoute from "./event.route";
import ticketRoute from "./ticket.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/artists", artistRoute);
router.use("/events", eventRoute);
router.use("/tickets",ticketRoute);

export default router;