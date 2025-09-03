import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path";
dotenv.config();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://nextalk-chat.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/", (req, res) => {
  res.json("HELLO From Backend");
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
