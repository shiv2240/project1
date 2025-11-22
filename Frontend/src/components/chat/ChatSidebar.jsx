import React, { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import ModeBadge from "./ModeBadge";

export default function ChatSidebar() {
  const {
    conversations,
    selectedId,
    loadConversation,
    createSingleConversation,
    createMultiConversation,
    renameChat,
    deleteChat,
    loadingConversations,
    PROVIDERS
  } = useChat();

  const [newMode, setNewMode] = useState("single"); // 'single' | 'multi'
  const [title, setTitle] = useState("");
  const [singleProvider, setSingleProvider] = useState("chatgpt");
  const [managerProvider, setManagerProvider] = useState("chatgpt");
  const [frontendProvider, setFrontendProvider] = useState("gemini");
  const [backendProvider, setBackendProvider] = useState("perplexity");

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    const baseTitle = title || (newMode === "single" ? "New Single Chat" : "New Orchestrated Chat");

    if (newMode === "single") {
      await createSingleConversation({ title: baseTitle, provider: singleProvider });
    } else {
      await createMultiConversation({
        title: baseTitle,
        managerProvider,
        frontendProvider,
        backendProvider
      });
    }
    setTitle("");
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    if (!renamingId) return;
    await renameChat(renamingId, renameValue || "Untitled");
    setRenamingId(null);
    setRenameValue("");
  }

  return (
    <aside className="w-[320px] flex flex-col min-h-0 overflow-y-auto p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mb-4">
        Conversations
      </h2>

      {/* New chat form */}
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <div className="flex text-[11px] bg-black/40 rounded-lg p-1 border border-white/10 mb-1">
          <button
            type="button"
            onClick={() => setNewMode("single")}
            className={`flex-1 py-1 rounded-md ${
              newMode === "single" ? "bg-white/10 font-semibold" : "text-white/60"
            }`}
          >
            Single-AI
          </button>
          <button
            type="button"
            onClick={() => setNewMode("multi")}
            className={`flex-1 py-1 rounded-md ${
              newMode === "multi" ? "bg-white/10 font-semibold" : "text-white/60"
            }`}
          >
            Multi-AI
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New chat title"
          className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
        />

        {newMode === "single" ? (
          <select
            value={singleProvider}
            onChange={(e) => setSingleProvider(e.target.value)}
            className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-1 gap-2 text-[11px]">
            <div>
              <div className="mb-1 text-white/60">Manager</div>
              <select
                value={managerProvider}
                onChange={(e) => setManagerProvider(e.target.value)}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-white/60">Frontend</div>
              <select
                value={frontendProvider}
                onChange={(e) => setFrontendProvider(e.target.value)}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-white/60">Backend</div>
              <select
                value={backendProvider}
                onChange={(e) => setBackendProvider(e.target.value)}
                className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-sm font-medium"
        >
          New {newMode === "single" ? "Single-AI" : "Multi-AI"} Chat
        </button>
      </form>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scroll">
        {loadingConversations && (
          <div className="text-xs text-white/50">Loading chats…</div>
        )}

        {!loadingConversations && conversations.length === 0 && (
          <div className="text-xs text-white/40">
            No conversations yet. Create your first chat.
          </div>
        )}

        {conversations.map((c) => (
          <div
            key={c._id}
            className={`group px-3 py-2 rounded-lg text-sm flex items-center justify-between cursor-pointer ${
              selectedId === c._id
                ? "bg-white/15 border border-white/20"
                : "bg-black/30 border border-white/5 hover:bg-black/40"
            }`}
            onClick={() => loadConversation(c._id)}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {renamingId === c._id ? (
                  <form onSubmit={handleRenameSubmit}>
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-black/60 border border-white/20 rounded px-1 text-xs"
                    />
                  </form>
                ) : (
                  c.title
                )}
              </span>
              <div className="flex items-center gap-1">
                <ModeBadge mode={c.mode} />
                <span className="text-[10px] uppercase tracking-wide text-white/40">
                  {c.mode === "multi"
                    ? `Mgr:${c.managerProvider} · FE:${c.frontendProvider} · BE:${c.backendProvider}`
                    : c.provider}
                </span>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              {renamingId !== c._id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingId(c._id);
                    setRenameValue(c.title);
                  }}
                  className="text-[10px] px-2 py-1 rounded bg-white/10"
                >
                  Rename
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(c._id);
                }}
                className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
