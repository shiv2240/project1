import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AppHeader({ user }) {
  const { logout } = useAuth();

  return (
    <header className="p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-blue-500/20 backdrop-blur-xl flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">
          Multi-AI Orchestrator
        </h1>
        <p className="text-xs text-white/60">
          Single Manager-AI. Hidden Frontend / Backend agents.
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-white/70">{user?.name}</span>
        <button
          onClick={logout}
          
          className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
