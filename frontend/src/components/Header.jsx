import React, { useState, useEffect } from "react";

export default function Header({ title = "New Chat", onRename, onClear }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);

  useEffect(() => setVal(title), [title]);

  const save = () => {
    setEditing(false);
    const trimmed = val.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
  };

  return (
    <header
      className="
        px-5 py-4 flex items-center justify-between
        bg-[#111] text-gray-200 
        border-b border-[#222]
        shadow-sm
      "
    >
      {/* LEFT: Title */}
      <div className="min-w-0">
        {editing ? (
          <input
            className="
              p-1 rounded bg-[#1a1a1a] text-gray-200 border border-[#333]
              w-64
              focus:outline-none focus:ring-1 focus:ring-indigo-500
            "
            value={val}
            autoFocus
            onChange={(e) => setVal(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setVal(title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <h1
            className="text-base font-semibold text-gray-100 truncate"
            onClick={() => setEditing(true)}
            title="Click to rename"
          >
            {title}
          </h1>
        )}

        <p className="text-xs text-gray-500">AI Assistant</p>
      </div>

      {/* RIGHT: Clear Button */}
      <div>
        <button
          onClick={onClear}
          className="
            px-3 py-1.5 rounded-lg text-sm
            bg-[#1f1f1f] hover:bg-[#2a2a2a]
            text-gray-300
            border border-[#333]
            transition
          "
        >
          Clear Chat
        </button>
      </div>
    </header>
  );
}
