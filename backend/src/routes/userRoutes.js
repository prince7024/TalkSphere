import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get currently logged-in user
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
