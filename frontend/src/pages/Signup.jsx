import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Toast from "../components/Toast.jsx";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const { fetchMe } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email, password });
      await fetchMe();
      navigate("/chat");
    } catch (err) {
      showToast(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#111]">
      <form
        onSubmit={handleSignup}
        className="bg-[#1a1a1a] border border-[#333]
                   p-8 rounded-xl shadow-lg w-full max-w-sm animate-fade-in"
      >
        <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 mb-4 rounded-lg bg-[#111] text-gray-200 
                     border border-[#333] focus:outline-none focus:ring-1 
                     focus:ring-indigo-500 placeholder-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-[#111] text-gray-200 
                     border border-[#333] focus:outline-none focus:ring-1 
                     focus:ring-indigo-500 placeholder-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password with Eye Icon */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-[#111] text-gray-200 
                       border border-[#333] focus:outline-none focus:ring-1 
                       focus:ring-indigo-500 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-gray-400 hover:text-gray-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 
                     text-white font-medium py-3 rounded-lg mt-2 transition"
        >
          Sign Up
        </button>

        <p className="text-sm text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Log In
          </Link>
        </p>
      </form>

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default Signup;
