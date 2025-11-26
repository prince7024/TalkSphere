import React, { useState } from "react";
import ConversationItem from "./ConversationItem.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { Plus, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  conversations = [],
  activeId,
  onOpen,
  onNew,
  onRename,
  onDelete,
  onSearch,
  searchValue,
  loading,
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const avatarUrl = user?.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User"
      )}&background=444&color=fff&rounded=true`;

  return (
    <aside
      className={`
        bg-[#222] text-gray-200 border-r border-[#2f2f2f]
        flex flex-col transition-all duration-300 h-full relative
        ${collapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 right-2 bg-[#333] hover:bg-[#444] 
                   text-gray-200 rounded p-1 hidden md:block"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* TOP SECTION */}
      <div className="p-4 select-none">

        {/* APP NAME */}
        <div className={`flex items-center gap-2 mb-5 ${collapsed ? "justify-center" : ""}`}>
          <MessageSquare size={26} className="text-indigo-400" />
          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide text-gray-100">
              TalkSphere
            </h2>
          )}
        </div>

        {/* NEW CHAT BUTTON */}
        <button
          onClick={onNew}
          className={`
            w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 
            text-white py-2 px-3 rounded-lg mb-5 
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <Plus size={18} />
          {!collapsed && <span>New Chat</span>}
        </button>

        {/* CHATS HEADING */}
        {!collapsed && (
          <div className="uppercase text-gray-400 text-xs font-semibold mb-2">
            Chats
          </div>
        )}
      </div>

      {/* HISTORY LIST */}
      <div className="flex-1 overflow-auto px-3 space-y-1">

        {loading && !collapsed && (
          <div className="animate-pulse text-sm text-gray-400">Loading…</div>
        )}

        {!loading && conversations.length === 0 && !collapsed && (
          <div className="text-sm text-gray-500">No conversations yet</div>
        )}

        {conversations.map((c) => (
          <ConversationItem
            key={c.id}
            conv={c}
            active={c.id === activeId}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* BOTTOM PROFILE SECTION */}
      <div className="p-3 border-t border-[#2f2f2f] bg-[#222]">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          
          {/* USER INFO */}
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img src={avatarUrl} className="w-10 h-10 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          )}

          {/* MENU */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded hover:bg-[#333]"
            >
              ⋮
            </button>

            {!collapsed && menuOpen && (
              <div className="absolute right-0 bottom-12 w-40 bg-[#1c1c1c] border border-[#333] rounded-lg shadow-xl z-50">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] text-gray-200"
                >
                  Settings
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] text-red-400"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </aside>
  );
}

