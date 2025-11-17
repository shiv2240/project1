import React, { useState } from "react";
import { useOrchestration } from "../contexts/OrchestrationContext";

const PROVIDERS = ["ChatGPT", "Gemini", "Perplexity"];

export default function ModelSelection() {
  const {
    providers,
    setProviders,
    providersConfig,
    setProvidersConfig,
    workspaceInitialized,
    setWorkspaceInitialized,
  } = useOrchestration();

  const [local, setLocal] = useState(providers);

  function handleProvider(role, val) {
    setLocal((s) => ({ ...s, [role]: val }));

    // Reset token for that provider
    setProvidersConfig((pc) => ({
      ...pc,
      [role]: { name: val, token: "" },
    }));

    // Mark workspace as not ready
    setWorkspaceInitialized(false);
  }

  function handleToken(role, token) {
    setProvidersConfig((pc) => ({
      ...pc,
      [role]: { ...pc[role], token },
    }));

    // Any token change resets Ready flag
    setWorkspaceInitialized(false);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
        AI Provider Selection
      </h2>

      {["manager", "frontend", "backend"].map((role) => (
        <div key={role} className="space-y-2">
          <label className="text-xs tracking-wide uppercase text-white/60">
            {role} provider
          </label>

          <select
            value={local[role]}
            onChange={(e) => handleProvider(role, e.target.value)}
            className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm focus:ring-2 focus:ring-pink-500"
          >
            {PROVIDERS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <input
            type="password"
            value={providersConfig[role]?.token || ""}
            placeholder={`${local[role]} token`}
            onChange={(e) => handleToken(role, e.target.value)}
            className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
          />
        </div>
      ))}

      <button
        onClick={() => setWorkspaceInitialized(true)}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-medium shadow-lg hover:opacity-90 transition"
      >
        {workspaceInitialized ? "Workspace Ready" : "Initialize Workspace"}
      </button>
    </div>
  );
}
