import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://nextalk-chat.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

//used to store online user from socket . io



const userSocketMap = {}; //{userId: socketId}
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); //send broadcast all the user
  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); //send broadcast all the user
  });
});

export { io, app, server };
