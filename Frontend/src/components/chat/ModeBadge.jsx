import React from "react";

export default function ModeBadge({ mode }) {
  if (!mode) return null;
  const isMulti = mode === "multi";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
        isMulti
          ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
          : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
      }`}
    >
      {isMulti ? "Multi-AI" : "Single-AI"}
    </span>
  );
}
