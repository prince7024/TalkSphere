import React from "react";

export default function Toast({ message }) {
  return (
    <div
      className="
        fixed top-6 left-1/2 transform -translate-x-1/2
        bg-[#222] text-white text-sm px-4 py-2
        rounded-lg shadow-lg border border-[#444]
        z-9999 animate-fade-in
      "
    >
      {message}
    </div>
  );
}
