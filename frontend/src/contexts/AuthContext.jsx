import React, { createContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchMe = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const res = await api.get("/user/me");
      setUser(res.data.user);
    } catch (err) {
      
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  
  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchMe,
        logout,
        loadingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
