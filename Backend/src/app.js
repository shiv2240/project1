// src/app.js
import express from "express";
import cors from "cors";
import "./config/db.js"; // connect MongoDB
import rateLimiter from "./middleware/rateLimiter.js";

import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Simple greet / health
app.get("/", (req, res) => {
  res.json({ message: "Multi-AI Orchestrator backend is running ✅" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/api", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

export default app;
