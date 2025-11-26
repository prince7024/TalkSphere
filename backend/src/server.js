import mongoose from "mongoose";
import app from "./app.js";
import { PORT, MONGO_URI } from "./config/env.js";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection failed:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
