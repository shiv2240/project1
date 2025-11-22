// src/models/Conversation.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, default: "New chat" },

    // SINGLE MODE
    provider: {
      type: String,
      enum: ["chatgpt", "gemini", "perplexity"],
      required: false,
    },

    // MULTI MODE
    managerProvider: {
      type: String,
      enum: ["chatgpt", "gemini", "perplexity"],
      default: null,
    },
    frontendProvider: {
      type: String,
      enum: ["chatgpt", "gemini", "perplexity"],
      default: null,
    },
    backendProvider: {
      type: String,
      enum: ["chatgpt", "gemini", "perplexity"],
      default: null,
    },

    // 🔥 REQUIRED NEW MODE FIELD
    mode: {
      type: String,
      enum: ["single", "multi"],
      required: true,
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
