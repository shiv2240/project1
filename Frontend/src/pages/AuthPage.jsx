import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-semibold mb-2 text-center">
          Multi-AI Orchestrator
        </h1>
        <p className="text-xs text-center text-white/50 mb-6">
          Orchestrate ChatGPT, Gemini, and Perplexity behind a single Manager.
        </p>
        <div className="flex mb-6 gap-2">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === "login"
                ? "bg-gradient-to-r from-pink-500 to-blue-500 font-semibold"
                : "bg-black/40 border border-white/10"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === "register"
                ? "bg-gradient-to-r from-pink-500 to-blue-500 font-semibold"
                : "bg-black/40 border border-white/10"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs text-white/60">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
                placeholder="At least 5 characters"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-white/10 text-sm"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg p-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Please wait..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
