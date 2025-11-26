// frontend/src/services/chatApi.js
import { api } from "./api";

// List all conversations
export const apiListConversations = async () => {
  const res = await api.get("/chat");
  return res.data; // { conversations: [...] }
};

// Get single conversation with messages
export const apiGetConversation = async (convId) => {
  const res = await api.get(`/chat/${convId}`);
  return res.data; // { conv: {...} }
};

// Send message (create or continue conversation)
export const apiSendMessage = async (payload) => {
  const res = await api.post("/chat", payload);
  return res.data; // { convId, reply, assistant? }
};

// Create new conversation
export const apiCreateConversation = async (title = "New chat") => {
  const res = await api.post("/chat/new", { title });
  return res.data; // { id }
};

// Rename conversation
export const apiRenameConversation = async (convId, title) => {
  const res = await api.post("/chat/rename", { convId, title });
  return res.data;
};

// Delete conversation
export const apiDeleteConversation = async (convId) => {
  const res = await api.delete(`/chat/${convId}`);
  return res.data;
};
