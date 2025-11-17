import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "orchestration_v1";

const defaultProviders = {
  manager: "ChatGPT",
  frontend: "ChatGPT",
  backend: "ChatGPT",
};

const defaultConfigs = {
  manager: { name: "ChatGPT", token: "" },
  frontend: { name: "ChatGPT", token: "" },
  backend: { name: "ChatGPT", token: "" },
};

const OrchestrationContext = createContext(null);

export function OrchestrationProvider({ children }) {
  const [providers, setProviders] = useState(defaultProviders);
  const [providersConfig, setProvidersConfig] = useState(defaultConfigs);

  const [systemPrompts, setSystemPrompts] = useState({
    manager:
      "You are the Manager-AI. Interpret user prompts, produce frontendInstruction and backendInstruction, send to sub-agents, synthesize the responses, and reply to the user.",
    frontend:
      "You are Frontend-AI. Respond only to Manager.",
    backend:
      "You are Backend-AI. Respond only to Manager.",
  });

  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "sys-1",
      role: "manager",
      from: "Manager-AI",
      text: "Initialize the workspace by selecting providers and clicking Initialize Workspace.",
      ts: Date.now(),
    },
  ]);

  // ---------- LOAD ON START ----------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProviders(parsed.providers || defaultProviders);
        setProvidersConfig(parsed.providersConfig || defaultConfigs);
        setMessages(parsed.messages || []);
        setWorkspaceInitialized(parsed.workspaceInitialized || false);
      }
    } catch (err) {
      console.error("Failed to load persisted state", err);
    }
  }, []);

  // ---------- SAVE ON CHANGE ----------
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          providers,
          providersConfig,
          messages,
          workspaceInitialized,
        })
      );
    } catch (e) {
      console.warn("Failed to save orchestration state", e);
    }
  }, [providers, providersConfig, messages, workspaceInitialized]);

  function pushManagerMessage(message) {
    setMessages((s) => [...s, { ...message, ts: Date.now() }]);
  }
function resetWorkspace() {
  localStorage.removeItem(STORAGE_KEY);

  setProviders(defaultProviders);
  setProvidersConfig(defaultConfigs);
  setMessages([
    {
      id: "sys-1",
      role: "manager",
      from: "Manager-AI",
      text: "Initialize the workspace by selecting providers and clicking Initialize Workspace.",
      ts: Date.now(),
    },
  ]);
  setWorkspaceInitialized(false);
}

  return (
    <OrchestrationContext.Provider
      value={{
        providers,
        setProviders,
        providersConfig,
        setProvidersConfig,
        systemPrompts,
        setSystemPrompts,
        workspaceInitialized,
        setWorkspaceInitialized,
        messages,
        pushManagerMessage,
      }}
    >
      {children}
    </OrchestrationContext.Provider>
  );
}

export function useOrchestration() {
  return useContext(OrchestrationContext);
}
