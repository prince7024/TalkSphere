import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";

// REGISTER
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);

  res.status(201).json({
    token, // 🔥 token frontend ko bhej rahe hain
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user._id);

  res.json({
    token, // 🔥 token frontend ko bhej rahe hain
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// LOGOUT (frontend localStorage clear karega)
export const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out" });
});
