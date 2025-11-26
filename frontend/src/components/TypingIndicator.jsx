import React from "react";

const TypingIndicator = ({ side = "left" }) => {
  const justify = side === "right" ? "justify-end" : "justify-start";
  const bg = side === "right" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700";

  return (
    <div className={`flex ${justify} mb-3`}>
      <div className={`inline-flex items-center gap-2 p-2 rounded-lg ${bg}`}>
        <span className="w-2 h-2 rounded-full animate-[typing_1.2s_infinite] bg-current opacity-90" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full animate-[typing_1.2s_infinite] bg-current opacity-70" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full animate-[typing_1.2s_infinite] bg-current opacity-50" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
