import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default function MessageBubble({
  role = "assistant",
  content = "",
  createdAt = "",
}) {
  const isUser = role === "user";

  return (
    <div
      className={`
        flex w-full mb-3
        ${isUser ? "justify-end" : "justify-start"}
        animate-fade-in
      `}
    >
      <div
        className={`
          max-w-[78%] whitespace-pre-wrap break-anywhere
          px-4 py-3 rounded-2xl shadow-lg
          text-sm leading-relaxed
          ${
            isUser
              ? "bg-indigo-600 text-white"
              : "bg-[rgba(255,255,255,0.06)] text-gray-200 backdrop-blur-xl border border-[rgba(255,255,255,0.14)]"
          }
        `}
      >
        {/* Markdown Renderer */}
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight]}
          components={{
            p: ({ children }) => (
              <p className="my-2 text-[0.95rem] leading-relaxed">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-100">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-300">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            code: ({ children }) => (
              <code className="bg-black/40 text-blue-300 px-1 py-0.5 rounded">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-black/40 text-gray-100 p-3 rounded-lg overflow-x-auto my-3">
                {children}
              </pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Timestamp */}
        {createdAt && (
          <div className="text-[11px] opacity-50 mt-2">
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
