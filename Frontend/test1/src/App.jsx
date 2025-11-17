import React from "react";
import ModelSelection from "./components/ModelSelection";
import ChatWorkspace from "./components/ChatWorkspace";
import { OrchestrationProvider } from "./contexts/OrchestrationContext";
import "./App.css";

export default function App() {
  return (
    <OrchestrationProvider>
      <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-blue-500/20 backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-wide">
            Multi-AI Orchestration
          </h1>
          <p className="text-sm text-white/60 mt-1">
            Manager-AI coordinates Frontend & Backend AI silently.
          </p>
        </header>

        {/* Two Column Layout */}
        <main className="flex flex-1 gap-6 p-6 min-h-0">
          {/* Left Panel */}
          <aside className="w-[320px] flex flex-col min-h-0  overflow-y-auto p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
            <ModelSelection />
          </aside>

          {/* Right Panel */}
          <section className="flex flex-col flex-1 min-h-0 overflow-hidden p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
            <ChatWorkspace />
          </section>
        </main>

        {/* <footer className="p-4 text-center text-xs text-white/40 border-t border-white/5">
          Only Manager output is visible. Sub-agents remain hidden.
        </footer> */}
      </div>
    </OrchestrationProvider>
  );
}
