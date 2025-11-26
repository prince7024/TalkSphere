import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import Header from "../components/Header.jsx";
import Toast from "../components/Toast.jsx";

import {
  apiListConversations,
  apiGetConversation,
  apiSendMessage,
  apiCreateConversation,
  apiRenameConversation,
  apiDeleteConversation,
} from "../services/chatApi.js";

const DRAFT_KEY = "chat_draft";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);     // Mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(localStorage.getItem(DRAFT_KEY) || "");
  const [listLoading, setListLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* Toast */
  const showToast = (msg, ms = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  /* Save Draft */
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim()) localStorage.setItem(DRAFT_KEY, input);
      else localStorage.removeItem(DRAFT_KEY);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  /* Textarea Auto-size */
  const autosize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  };
  useEffect(() => autosize(), [input]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* Load Conversations */
  const loadList = async () => {
    setListLoading(true);
    try {
      const res = await apiListConversations();
      const convs = (res?.conversations || []).map((c) => ({
        id: c.id || c._id,
        title: c.title || "Untitled",
        updatedAt: c.updatedAt,
        lastMessage: c.lastMessage,
      }));
      setConversations(convs);

      if (!activeId && convs.length) setActiveId(convs[0].id);
    } catch {
      showToast("Failed to load conversations");
    } finally {
      setListLoading(false);
    }
  };

  /* Open Conversation */
  const openConversation = async (id) => {
    setSidebarOpen(false); // auto-close on mobile

    if (!id) {
      setMessages([]);
      setActiveId(null);
      return;
    }

    setMessagesLoading(true);
    setActiveId(id);

    try {
      const res = await apiGetConversation(id);
      setMessages(res?.conv?.messages || []);
      setTimeout(() => scrollToBottom(), 80);
    } catch {
      showToast("Failed to load conversation");
    } finally {
      setMessagesLoading(false);
    }
  };

  /* New Conversation */
  const newConversation = async () => {
    try {
      const res = await apiCreateConversation("New chat");
      const newId = res?.id;
      await loadList();
      openConversation(newId);
    } catch {
      showToast("Failed to create conversation");
    }
  };

  /* Rename */
  const renameConversation = async (id, title) => {
    try {
      await apiRenameConversation(id, title);
      await loadList();
    } catch {
      showToast("Rename failed");
    }
  };

  /* Delete */
  const deleteConversation = async (id) => {
    try {
      await apiDeleteConversation(id);
      setMessages([]);
      await loadList();
    } catch {
      showToast("Delete failed");
    }
  };

const send = async (e) => {
  e?.preventDefault();
  if (!input.trim()) return;

  const text = input.trim();
  localStorage.removeItem(DRAFT_KEY);

  const optimistic = {
    role: "user",
    content: text,
    createdAt: new Date().toISOString(),
    _optimistic: true,
  };

  const isFirstMessage = messages.length === 0;  // <--- IMPORTANT

  setMessages((p) => [...p, optimistic]);
  setInput("");

  try {
    setIsTyping(true);

    const res = await apiSendMessage({
      convId: activeId,
      message: text,
    });

    // If this is the FIRST message → auto-generate title
    if (isFirstMessage) {
      const autoTitle = generateTitle(text);
      await apiRenameConversation(activeId, autoTitle);
      await loadList();
    }

    // AI reply
    setMessages((p) => {
      const stable = p.filter((m) => !m._optimistic);
      return [
        ...stable,
        optimistic,
        {
          role: "assistant",
          content: res?.reply || "",
          createdAt: new Date().toISOString(),
        },
      ];
    });

    await loadList();
  } finally {
    setIsTyping(false);
    scrollToBottom();
  }
};

  /* Ctrl+Enter */
  const onKeyDownInput = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  /* Load Conversations Initially */
  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (activeId) openConversation(activeId);
  }, [activeId]);

  // Generate clean auto-title from first user message
const generateTitle = (text) => {
  let cleaned = text.replace(/\s+/g, " ").trim();

  // keep title short and readable
  if (cleaned.length > 30) {
    cleaned = cleaned.slice(0, 30) + "...";
  }

  // uppercase first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned;
};


  return (
    <div className="flex h-screen bg-[#111] overflow-hidden">

      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#222] border border-[#333] 
                   text-gray-200 p-2 rounded-lg"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar (drawer on mobile, normal on desktop) */}
      <div
        className={`
          fixed md:static h-full
          transform transition-transform duration-300 z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-72 md:translate-x-0"}
        `}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onOpen={openConversation}
          onNew={newConversation}
          onRename={renameConversation}
          onDelete={deleteConversation}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          loading={listLoading}
          searchValue={""}
          onSearch={() => {}}
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area (NO MARGIN – FIXED) */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl shadow-lg 
                          flex flex-col h-full overflow-hidden">

            <Header
              title={conversations.find((c) => c.id === activeId)?.title || "New Chat"}
              onRename={(t) => renameConversation(activeId, t)}
              onClear={() => setMessages([])}
            />

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin 
                         scrollbar-thumb-[#222] scrollbar-track-[#111]"
            >
              {messagesLoading && (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 w-40 bg-[#2c2c2c] rounded"></div>
                  <div className="h-6 w-60 bg-[#2c2c2c] rounded"></div>
                </div>
              )}

              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  createdAt={m.createdAt}
                />
              ))}

              {isTyping && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#222] bg-[#1a1a1a] p-4">
              <form onSubmit={send} className="max-w-3xl mx-auto flex gap-3">
                <textarea
                  ref={textareaRef}
                  className="flex-1 resize-none bg-[#111] text-gray-200 border border-[#333]
                             p-3 rounded-2xl"
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onInput={autosize}
                  onKeyDown={onKeyDownInput}
                  rows={1}
                />

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 text-white disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>

      {toast && <Toast message={toast} />}
    </div>
  );
}
