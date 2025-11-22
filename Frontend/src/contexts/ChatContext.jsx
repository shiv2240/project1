import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const PROVIDERS = ["chatgpt", "gemini", "perplexity"];

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sending, setSending] = useState(false);

  async function fetchConversations() {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const res = await api.get("/api/chats");
      setConversations(res.data);
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    } finally {
      setLoadingConversations(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, [user]);

  async function createSingleConversation({ title, provider }) {
    const res = await api.post("/api/chats", {
      title,
      provider
    });
    setConversations((prev) => [res.data, ...prev]);
    setSelectedId(res.data._id);
    setSelectedConversation(res.data);
  }

  async function createMultiConversation({
    title,
    managerProvider,
    frontendProvider,
    backendProvider
  }) {
    const res = await api.post("/api/chats", {
      title,
      managerProvider,
      frontendProvider,
      backendProvider
    });
    setConversations((prev) => [res.data, ...prev]);
    setSelectedId(res.data._id);
    setSelectedConversation(res.data);
  }

  async function loadConversation(id) {
    setSelectedId(id);
    try {
      const res = await api.get(`/api/chats/${id}`);
      setSelectedConversation(res.data);
    } catch (e) {
      console.error("Failed to load conversation", e);
    }
  }

  async function renameChat(id, title) {
    const res = await api.put(`/api/chats/${id}`, { title });
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title: res.data.title } : c))
    );
    if (selectedConversation?._id === id) {
      setSelectedConversation((prev) => ({ ...prev, title: res.data.title }));
    }
  }

  async function deleteChat(id) {
    await api.delete(`/api/chats/${id}`);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedConversation(null);
    }
  }

  async function updateProviders(id, { managerProvider, frontendProvider, backendProvider }) {
    const res = await api.put(`/api/chats/${id}/providers`, {
      managerProvider,
      frontendProvider,
      backendProvider
    });
    const updated = res.data.conversation;
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? updated : c))
    );
    if (selectedConversation?._id === id) {
      setSelectedConversation(updated);
    }
  }

  async function sendChatMessage(message) {
    if (!selectedConversation) return;
    setSending(true);
    try {
      const res = await api.post(
        `/api/chats/${selectedConversation._id}/messages`,
        { message }
      );
      const { messages } = res.data;
      setSelectedConversation((prev) => ({
        ...(prev || {}),
        _id: res.data.conversationId,
        messages
      }));
      // update list updatedAt ordering if you want to refetch
      fetchConversations();
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedConversation,
        selectedId,
        loadingConversations,
        sending,
        createSingleConversation,
        createMultiConversation,
        loadConversation,
        renameChat,
        deleteChat,
        updateProviders,
        sendChatMessage,
        PROVIDERS
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
