import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  async function login({ email, password }) {
    const res = await api.post("/api/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("ma_token", token);
    setUser(user);
  }

  async function register({ name, email, password }) {
    const res = await api.post("/api/auth/register", { name, email, password });
    const { token, user } = res.data;
    localStorage.setItem("ma_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("ma_token");
    setUser(null);
  }

  async function loadMe() {
    try {
      const token = localStorage.getItem("ma_token");
      if (!token) {
        setInitializing(false);
        return;
      }
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch (e) {
      localStorage.removeItem("ma_token");
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
