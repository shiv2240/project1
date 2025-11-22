// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 req / min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment and try again.",
  },
});

export default limiter;
