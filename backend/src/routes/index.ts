import { Router } from "express";
import authRoute from "./auth.route";
import adminRoute from "./admin.route";
import artistRoute from "./artist.route";
import eventRoute from "./event.route";
import ticketRoute from "./ticket.route";
import ticketCategoryRoutes from "./ticket-category.route";
import orderRoute from "./order.route";
import logRoute from "./log.route";
import userRoute from "./user.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/artists", artistRoute);
router.use("/events", eventRoute);
router.use("/tickets", ticketRoute);
router.use("/ticket-categories", ticketCategoryRoutes);
router.use("/orders", orderRoute);
router.use("/logs", logRoute);
router.use("/superadmin/logs", logRoute);
router.use("/users", userRoute);
router.use("/superadmin/users", userRoute);

export default router;