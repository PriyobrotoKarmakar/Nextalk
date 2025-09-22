import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Simple uptime check endpoint
router.get("/uptime", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is up and running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// More detailed health check with DB status
router.get("/", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };
    
    res.status(200).json({
      status: "success",
      message: "Health check successful",
      server: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      database: {
        status: dbStates[dbStatus],
        connected: dbStatus === 1
      }
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message
    });
  }
});

export default router;
