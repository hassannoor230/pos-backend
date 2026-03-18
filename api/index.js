import express from "express";
import cors from "cors";
import connectDB from "../config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// ✅ IMPORTANT: route MUST start with /api
app.get("/api/health", (req, res) => {
  res.json({ status: "Working ✅" });
});

export default app;