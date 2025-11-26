import OpenAI from "openai";
import { GEMINI_API_KEY } from "../config/env.js";


const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


const buildSystemPrompt = () => {
  return `
You are a highly professional AI assistant. Follow these rules in every response:

**Style & Tone**
- Be clear, concise, structured, and professional.
- Avoid filler, unnecessary explanations, and informal/slang language.
- Prefer short paragraphs (2-3 lines maximum).

**Formatting**
- Use headings and subheadings for clear structure.
- Use bullet points for lists and numbered steps when giving instructions.
- Provide code inside fenced code blocks with correct language labels.
- Highlight important points using bold text.

**Behavior**
- Answer directly without repeating the question unless required.
- When giving examples, keep them minimal, correct, and runnable.
- If a question is unclear, ask one short clarifying question.
- When debugging: provide the corrected code first, then a short explanation.

**Accuracy**
- Do not invent APIs, data, or behavior that does not exist.
- If information is missing or uncertain, say “I don’t have enough information” and request details.

Your goal is to provide accurate, structured, helpful, and professional responses.
`;
};

/** Convert conversation history + user message into model messages */
const buildMessages = (message, history = []) => {
  const systemMsg = { role: "system", content: buildSystemPrompt() };

  const mappedHistory = Array.isArray(history)
    ? history.map(h => ({ role: h.role, content: h.content }))
    : [];

  const userMsg = { role: "user", content: message };

  return [systemMsg, ...mappedHistory, userMsg];
};

/**
 * sendMessageToOpenAI - primary function to call the model.
 * @param {string} message - latest user message
 * @param {Array} history - array of { role, content } objects
 * @param {Object} options - optional { model, maxTokens, temperature }
 * @returns {string} assistant text (safe string fallback on error)
 */
export const sendMessageToOpenAI = async (message, history = [], options = {}) => {
  const model = options.model || process.env.GEN_MODEL || "gemini-2.0-flash";
  const max_tokens = options.maxTokens || 800;
  const temperature = typeof options.temperature === "number" ? options.temperature : 0.2;

  const messages = buildMessages(message, history);

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens
    });

    // provider response shapes can vary; access safely:
    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content;

    // fallback: if content missing, stringify reasonable parts
    return JSON.stringify(response);
  } catch (err) {
    console.error("sendMessageToOpenAI error:", err?.message || err);

    // one retry for transient errors
    try {
      const retry = await openai.chat.completions.create({
        model,
        messages,
        max_tokens
      });
      const rcontent = retry?.choices?.[0]?.message?.content;
      if (typeof rcontent === "string") return rcontent;
      return JSON.stringify(retry);
    } catch (err2) {
      console.error("sendMessageToOpenAI retry failed:", err2?.message || err2);
      return "Error: Could not fetch response from the model at this time.";
    }
  }
};


export const sendMessageToGemini = sendMessageToOpenAI;

export default sendMessageToOpenAI;
