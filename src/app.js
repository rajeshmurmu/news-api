import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { limiter } from "./config/rate-limit.config.js";
import helmet from "helmet";

export const app = express();
export const PORT = process.env.PORT || 8000;

// middlewares
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: ["*"],
  })
);

// rate limit
app.use(limiter);

// * Import ApiRoutes routes
import ApiRoutes from "./routes/api.js";
app.use("/api/v1", ApiRoutes);

// custom 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Sorry can't find that!",
  });
});

// custom error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something broke!",
    error: err.message || "Internal Server Error",
  });
});

// * default route or api home route
app.get("/", (req, res) => {
  res.json({ message: "Hello from news api" });
});

import { emailWorker } from "./lib/worker.bullmq.js";
