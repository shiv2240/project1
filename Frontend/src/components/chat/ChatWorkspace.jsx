import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import ModeBadge from "./ModeBadge";
import MessageBubble from "./MessageBubble";

export default function ChatWorkspace() {
  const {
    selectedConversation,
    sending,
    sendChatMessage,
    updateProviders,
    PROVIDERS
  } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  const [editProviders, setEditProviders] = useState(false);
  const [mgr, setMgr] = useState("chatgpt");
  const [fe, setFe] = useState("gemini");
  const [be, setBe] = useState("perplexity");

  useEffect(() => {
    if (selectedConversation?.mode === "multi") {
      setMgr(selectedConversation.managerProvider || "chatgpt");
      setFe(selectedConversation.frontendProvider || "gemini");
      setBe(selectedConversation.backendProvider || "perplexity");
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation, sending]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/50 text-sm">
        Select or create a conversation to start chatting.
      </div>
    );
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    await sendChatMessage(text);
  }

  async function handleProviderSave() {
    await updateProviders(selectedConversation._id, {
      managerProvider: mgr,
      frontendProvider: fe,
      backendProvider: be
    });
    setEditProviders(false);
  }

  const isMulti = selectedConversation.mode === "multi";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="pb-3 mb-3 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">
              {selectedConversation.title}
            </h2>
            <ModeBadge mode={selectedConversation.mode} />
          </div>
          {isMulti ? (
            <p className="text-[11px] text-white/50">
              Manager: {selectedConversation.managerProvider} · Frontend:{" "}
              {selectedConversation.frontendProvider} · Backend:{" "}
              {selectedConversation.backendProvider}
            </p>
          ) : (
            <p className="text-[11px] text-white/50">
              Provider: {selectedConversation.provider}
            </p>
          )}
        </div>

        {isMulti && (
          <button
            onClick={() => setEditProviders((v) => !v)}
            className="text-[11px] px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
          >
            {editProviders ? "Close Providers" : "Edit Providers"}
          </button>
        )}
      </div>

      {/* Provider edit strip (multi only) */}
      {isMulti && editProviders && (
        <div className="mb-3 p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <div className="mb-1 text-white/60">Manager</div>
            <select
              value={mgr}
              onChange={(e) => setMgr(e.target.value)}
              className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-white/60">Frontend</div>
            <select
              value={fe}
              onChange={(e) => setFe(e.target.value)}
              className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-white/60">Backend</div>
            <select
              value={be}
              onChange={(e) => setBe(e.target.value)}
              className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={handleProviderSave}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-blue-500 text-xs font-semibold"
            >
              Save Providers
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 custom-scroll"
      >
        {selectedConversation.messages &&
          selectedConversation.messages.map((m, idx) => (
            <MessageBubble key={idx} message={m} />
          ))}
      </div>

      {/* Loader */}
      {sending && (
        <div className="mt-2 mb-1 text-xs text-white/60 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          <span>Manager-AI is orchestrating…</span>
        </div>
      )}

      {/* Composer */}
      <div className="flex-shrink-0 pt-3 border-t border-white/10 mt-2 flex items-center gap-3 bg-black/20 backdrop-blur-xl rounded-xl p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask the Manager-AI…"
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500"
        />

        <button
          onClick={handleSend}
          disabled={sending}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold shadow-lg hover:opacity-90 disabled:opacity-40"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
