// src/routes/aiRoutes.js
import { Router } from "express";
import {
  chatWithOpenAI,
  chatWithGemini,
  chatWithPerplexity,
} from "../controllers/aiController.js";

const router = Router();

// direct AI calls (used by your frontend providerAdapters)
router.post("/chatgpt", chatWithOpenAI);
router.post("/gemini", chatWithGemini);
router.post("/perplexity", chatWithPerplexity);

export default router;
