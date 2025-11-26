
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendMessageToGemini } from "../services/geminiService.js";


const extractFirstCodeBlock = (text) => {
  if (!text) return null;
  const fenceRe = /```(\w+)?\n([\s\S]*?)```/;
  const m = text.match(fenceRe);
  if (!m) return null;
  return { language: m[1] || "text", value: m[2].trim() };
};


const buildStructured = (text) => {
  if (!text || typeof text !== "string") return null;

  const firstLine = text.split("\n\n")[0] || text;
  const firstSentenceMatch = firstLine.match(/^(.*?[\.\!\?])\s/);
  const title = (firstSentenceMatch ? firstSentenceMatch[1] : firstLine).slice(0, 120);

 
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const summary = (paragraphs[0] || text).slice(0, 300);

 
  const sections = [];
  
  const bullets = text.match(/(^[-*]\s.+$|^\d+\.\s.+$)/gm);
  if (bullets && bullets.length) {
    sections.push({
      heading: "Key points",
      items: bullets.map(b => b.replace(/^-+\s?/, "").replace(/^\d+\.\s?/, "").trim()).slice(0, 10)
    });
  } else {
   
    for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
      sections.push({
        heading: i === 0 ? "Overview" : `Detail ${i}`,
        items: paragraphs[i].split(/(?:\.\s+)/).slice(0, 4).map(s => s.trim()).filter(Boolean)
      });
    }
  }

  
  const code = extractFirstCodeBlock(text);


  const preview = summary.length > 120 ? summary.slice(0, 120) + "..." : summary;


  const meta = { model: "gemini", time: Date.now() };

  return {
    text,
    title,
    summary,
    sections,
    code,
    preview,
    meta
  };
};


export const sendMessage = asyncHandler(async (req, res) => {
  const user = req.user;
  const { convId } = req.body;
  let { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message required" });
  }

  message = message.trim();
  if (!message) return res.status(400).json({ error: "Message required" });


  let conv = null;
  if (convId) {
    conv = await Conversation.findById(convId);
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (String(conv.userId) !== String(user._id))
      return res.status(403).json({ error: "Forbidden" });
  }

  if (!conv) {
    const title = message.length > 60 ? message.slice(0, 60) + "..." : message;
    conv = new Conversation({ userId: user._id, title, messages: [] });
  }


  conv.messages.push({ role: "user", content: message });

  const history = conv.messages.slice(-20).map(m => ({
    role: m.role,
    content: m.content,
  }));

 
  const rawReply = await sendMessageToGemini(message, history);

  let assistantReply = String(rawReply || "Sorry, I couldn’t generate a reply.");
  const isError = /error|network|forbidden|quota|authentication/i.test(assistantReply);


  if (assistantReply.length > 8000) {
    assistantReply = assistantReply.slice(0, 8000) + "...";
  }

  const assistantStructured = buildStructured(assistantReply);

 
  conv.messages.push({ role: "assistant", content: assistantReply, structured: assistantStructured });

  await conv.save();

  res.json({
    convId: conv._id,
    reply: assistantReply,
    assistant: assistantStructured, 
    updatedAt: conv.updatedAt,
    assistantPreview:
      assistantStructured?.preview ||
      (assistantReply.length > 120 ? assistantReply.slice(0, 120) + "..." : assistantReply),
    error: isError ? assistantReply : undefined,
  });
});


export const listConversations = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("_id title updatedAt messages");

  const items = convs.map(c => {
    const last = c.messages?.length
      ? c.messages[c.messages.length - 1]
      : null;

    return {
      id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
      lastMessage: last
        ? { role: last.role, content: String(last.content).slice(0, 200) }
        : null,
    };
  });

  res.json({ conversations: items });
});


export const getConversation = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });

  if (String(conv.userId) !== String(req.user._id))
    return res.status(403).json({ error: "Forbidden" });

  res.json({ conv });
});

export const renameConversation = asyncHandler(async (req, res) => {
  const { convId, title } = req.body;
  if (!convId || typeof title !== "string") return res.status(400).json({ error: "convId and title required" });

  const conv = await Conversation.findById(convId);
  if (!conv) return res.status(404).json({ error: "Not found" });
  if (String(conv.userId) !== String(req.user._id)) return res.status(403).json({ error: "Forbidden" });

  conv.title = title;
  await conv.save();

  res.json({ id: conv._id, title: conv.title });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const convId = req.params.id;

  if (!convId || !mongoose.Types.ObjectId.isValid(convId)) {
    return res.status(400).json({ error: "Invalid conversation id" });
  }

  const conv = await Conversation.findById(convId);
  if (!conv) return res.status(404).json({ error: "Not found" });
  if (String(conv.userId) !== String(req.user._id)) return res.status(403).json({ error: "Forbidden" });

  
  await Conversation.findByIdAndDelete(convId);

  res.json({ message: "Deleted", id: convId });
});


export const createConversation = asyncHandler(async (req, res) => {
  const user = req.user;
  const title = req.body.title || "New chat";
  const conv = new Conversation({ userId: user._id, title, messages: [] });
  await conv.save();
  res.status(201).json({ id: conv._id, title: conv.title });
});
