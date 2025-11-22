import React from "react";
import { useAuth } from "../contexts/AuthContext";
import AppHeader from "../components/layout/AppHeader";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWorkspace from "../components/chat/ChatWorkspace";

export default function WorkspacePage() {
  const { user } = useAuth();

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      <AppHeader user={user} />
      <main className="flex flex-1 gap-4 p-4 min-h-0">
        <ChatSidebar />
        <section className="flex flex-col flex-1 min-h-0 overflow-hidden p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
          <ChatWorkspace />
        </section>
      </main>
    </div>
  );
}
