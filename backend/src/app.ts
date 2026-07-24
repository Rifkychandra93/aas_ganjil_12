import express from "express";
import cors from "cors";
import routes from "./routes";
import { authMiddleware } from "@/middlewares/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: (req as any).user
  });
});
app.use("/api", routes);

app.get("/", (_, res) => {
    res.json({
        success: true,
        message: "Concert Ticket API"
    });
});

export default app;