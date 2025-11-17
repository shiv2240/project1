import React, { useState, useRef, useEffect } from "react";
import { useOrchestration } from "../contexts/OrchestrationContext";
import { orchestrateMessage } from "../api/orchestrator";
import MessageBubble from "./MessageBubble";

export default function ChatWorkspace() {
  const {
    workspaceInitialized,
    messages,
    pushManagerMessage,
    providersConfig,
    systemPrompts,
  } = useOrchestration();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!workspaceInitialized) {
    return (
      <p className="text-white/60 text-sm">
        Initialize the workspace to begin chatting.
      </p>
    );
  }

  async function send() {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");
    pushManagerMessage({ role: "user", from: "You", text });

    setBusy(true);

    try {
      const res = await orchestrateMessage({
        userPrompt: text,
        providersConfig,
        systemPrompts,
      });

      pushManagerMessage({
        role: "manager",
        from: "Manager-AI",
        text: res.finalResponse,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 custom-scroll"
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>

      {/* Composer fixed at bottom */}
      <div className="flex-shrink-0 pt-3 border-t border-white/10 mt-2 flex items-center gap-3 bg-black/20 backdrop-blur-xl rounded-xl p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && send()}
          placeholder="Ask Manager-AI..."
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500"
        />

        <button
          onClick={send}
          disabled={busy}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold shadow-lg hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
