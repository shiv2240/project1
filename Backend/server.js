// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import "./src/config/db.js";   // <-- IMPORTANT: Load DB FIRST
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

// Start server ONLY after DB is connected
import mongoose from "mongoose";

mongoose.connection.once("open", () => {
  console.log("⚡ MongoDB connection OPEN — Starting server...");
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
});
