import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";
import { authMiddleware } from "@/middlewares/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

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