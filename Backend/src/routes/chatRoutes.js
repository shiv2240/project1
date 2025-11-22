// src/routes/chatRoutes.js
import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import {
  createConversation,
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  sendMessageInConversation,
  updateProviders,
} from "../controllers/chatController.js";

const router = Router();

// All chat routes require auth
router.use(authRequired);

// CRUD on conversations
router.post("/", createConversation); // create new chat
router.get("/", listConversations); // list chats
router.get("/:id", getConversation); // load one chat
router.put("/:id", renameConversation); // rename chat
router.delete("/:id", deleteConversation); // delete chat
router.put("/:id/providers", updateProviders);


// send message in a chat + get AI reply
router.post("/:id/messages", sendMessageInConversation);

export default router;
