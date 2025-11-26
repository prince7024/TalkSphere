import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ChatPage from "./pages/ChatPage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { useAuth } from "./hooks/useAuth.js";

function ProtectedRoute({ children }) {
  const { user, loadingUser } = useAuth();

  if (loadingUser) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div className="p-8">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
