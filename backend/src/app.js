import express from "express";
import morgan from "morgan";
import { routes } from "./routes/index.js";
import { corsMiddleware, helmetMiddleware, rateLimitMiddleware } from "./middlewares/securityMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

export const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada."
  });
});

app.use(errorMiddleware);
