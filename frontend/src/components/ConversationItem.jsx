import React, { useState, useRef, useEffect } from "react";

export default function ConversationItem({
  conv,
  active,
  onOpen,
  onRename,
  onDelete,
  collapsed
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conv.title || "Untitled");

  const inputRef = useRef(null);

  // Auto-focus input on rename mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const unread =
    conv.lastMessage &&
    conv.lastMessage.role === "assistant" &&
    conv.updatedAt &&
    Date.now() - new Date(conv.updatedAt) < 1000 * 60 * 60 * 24;

  const saveRename = () => {
    setEditing(false);
    if (title.trim()) {
      onRename(conv.id, title.trim());
    }
  };

  return (
    <div
      className={`
        px-3 py-2 flex items-center justify-between cursor-pointer 
        border-b border-[#2f2f2f]
        ${active ? "bg-[#2b2b2b]" : "hover:bg-[#2a2a2a]"}
      `}
      onClick={() => !editing && onOpen(conv.id)}
    >
      {/* --- TITLE SECTION --- */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={saveRename}
            className="w-full bg-[#111] border border-[#444] rounded px-2 py-1 text-sm text-gray-200 outline-none"
          />
        ) : (
          <>
            <div className="text-sm text-gray-200 truncate">{title}</div>
            {!collapsed && (
              <div className="text-xs text-gray-500">
                {conv.updatedAt
                  ? new Date(conv.updatedAt).toLocaleString()
                  : ""}
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MENU (3 dots) --- */}
      {!collapsed && (
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="px-2 hover:bg-[#333] rounded"
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                absolute right-0 top-6 w-36 bg-[#1c1c1c] 
                border border-[#333] rounded-md shadow-lg z-40
              "
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#2a2a2a] text-gray-200"
              >
                Rename
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(conv.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#2a2a2a]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
