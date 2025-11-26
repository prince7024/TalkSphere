// backend/src/routes/chatRoutes.js
import express from "express";
import { 
  sendMessage,
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  createConversation
} from "../controllers/chatController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Chat operations
router.post("/", requireAuth, sendMessage);             // send message
router.post("/new", requireAuth, createConversation);  // create new conversation
router.post("/rename", requireAuth, renameConversation); // rename conversation
router.delete("/:id", requireAuth, deleteConversation); // delete conversation
router.get("/", requireAuth, listConversations);       // list all conversations
router.get("/:id", requireAuth, getConversation);      // get single conversation

export default router;

