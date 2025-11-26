// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchMe = async () => {
    setLoadingUser(true);
    try {
      const res = await api.get("/user/me");
      setUser(res.data.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  useEffect(() => { fetchMe(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchMe, logout, loadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};
