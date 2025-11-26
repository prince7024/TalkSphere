import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user","assistant","system"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // new optional structured object produced by server (title, summary, sections, code, preview, meta)
  structured: { type: mongoose.Schema.Types.Mixed, default: null }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New chat" },
  messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.model("Conversation", ConversationSchema);
