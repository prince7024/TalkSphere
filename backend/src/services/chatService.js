import { sendMessageToOpenAI } from "./geminiService.js";
import Conversation from "../models/Conversation.js";


export const getOrCreateConversation = async (userId, convId, message = "") => {
  let conv = null;

  if (convId) {
    conv = await Conversation.findById(convId);
    if (conv && String(conv.userId) === String(userId)) return conv;
  }

  const title = (message || "").length > 60 ? message.slice(0, 60) + "..." : (message || "New chat");
  return new Conversation({ userId, title, messages: [] });
};

/** Add a message to a conversation object in memory (does not save) */
export const addMessage = (conv, role, content, structured = null) => {
  if (!conv || !conv.messages) return;
  conv.messages.push({ role, content, createdAt: new Date(), structured });
};

/** Return last N messages formatted for model (role + content) */
export const getHistory = (conv, limit = 20) => {
  if (!conv || !Array.isArray(conv.messages)) return [];
  return conv.messages.slice(-limit).map(m => ({
    role: m.role,
    content: m.content
  }));
};


export const generateReply = async (message, history = [], options = {}) => {
  try {
    const reply = await sendMessageToOpenAI(message, history, options);
    return String(reply || "Sorry, I couldn't generate a reply.");
  } catch (err) {
    console.error("generateReply error:", err);
    return "Error: Could not generate a reply at this time.";
  }
};


export const saveConversation = async (conv) => {
  if (!conv) return null;
  return await conv.save();
};
