import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import healthRoutes from "./routes/health.route.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import mongoose from "mongoose";
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
app.get("/cronJob", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Use the health routes
app.use("/health", healthRoutes);

// Database connection check middleware
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database connection not ready",
      status: mongoose.connection.readyState 
    });
  }
  next();
};

app.use("/api/auth", checkDbConnection, authRoutes);
app.use("/api/messages", checkDbConnection, messageRoutes);
const PORT = process.env.PORT || 5001;

// Connect to database before starting server
const startServer = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
