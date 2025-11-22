// src/config/db.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

mongoose
  .connect(uri, {
    autoIndex: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
