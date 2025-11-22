import React from "react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[75%] p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-lg">
        <div
          className={`text-xs font-bold bg-gradient-to-r ${
            isUser ? "from-blue-400 to-pink-400" : "from-pink-400 to-blue-400"
          } bg-clip-text text-transparent mb-1`}
        >
          {isUser ? "You" : "Manager-AI"}
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>

        {message.createdAt && (
          <div className="text-[10px] text-white/40 mt-2">
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
