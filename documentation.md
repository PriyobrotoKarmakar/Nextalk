# Nextalk Project Documentation

## 1. Project Overview
Nextalk is a real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time capabilities.

**Key Technologies:**
- **Frontend:** React (Vite), TailwindCSS, DaisyUI, Zustand (State Management), React Router v7.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT (Authentication), Cloudinary (Image Upload).
- **Real-time:** Socket.io for instant messaging and online status updates.

## 2. Backend Structure & Code

### `backend/src/index.js`
**Purpose:** Entry point of the backend server. Sets up Express, middleware, database connection, and Socket.io server.
```javascript
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
```

### `backend/src/lib/db.js`
**Purpose:** Handles MongoDB connection.
```javascript
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error;
    }
};
```

### `backend/src/lib/socket.js`
**Purpose:** Configures Socket.io server and handles connection/disconnection events.
```javascript
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
```

### `backend/src/models/user.model.js`
**Purpose:** Mongoose schema for User.
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
```

### `backend/src/models/message.model.js`
**Purpose:** Mongoose schema for Message.
```javascript
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", messageSchema);
```

### `backend/src/middleware/auth.middleware.js`
**Purpose:** Middleware to verify JWT token and protect routes.
```javascript
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "Unauthorized - User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
```

### `backend/src/controllers/auth.controller.js`
**Purpose:** Handles authentication logic (signup, login, logout, profile update).
```javascript
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  const { fullName, email, password, profilePic } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate jwt token
      const token = generateToken(newUser._id, res);
      await newUser.save();
        return res.status(201).json({
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
          createdAt: newUser.createdAt,
          message: "User created successfully",
          token,
        });
    } else {
      return res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(existingUser._id, res);
    return res.status(200).json({
      _id: existingUser._id,
      email: existingUser.email,
      profilePic: existingUser.profilePic,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during profile update:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
```

### `backend/src/controllers/message.controller.js`
**Purpose:** Handles message-related logic (get users, get messages, send message).
```javascript
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          recieverId: userToChatId,
        },
        {
          senderId: userToChatId,
          recieverId: myId,
        },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;
        let imageUrl = null;
        if(image){
            const uploadResponse  = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image: imageUrl
        })
        await newMessage.save();
        //real time functionaly when socket io will be done

        const receiverSocketId = getReceiverSocketId(recieverId);
        if (receiverSocketId) {//if user is online
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
```

## 3. Frontend Structure & Code

### `frontend/src/main.jsx`
**Purpose:** Entry point of the React application.
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

### `frontend/src/App.jsx`
**Purpose:** Main application component. Handles routing and global authentication check.
```javascript
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import {Toaster} from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={<SettingsPage />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>


      <Toaster />
    </div>
  );
};

export default App;
```

### `frontend/src/lib/axios.js`
**Purpose:** Axios instance configuration with base URL and credentials.
```javascript
import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE==="development" ? "http://localhost:5001/api" :
    "https://nextalk-backend-43hu.onrender.com/api",
    withCredentials:true,
    
});
```

### `frontend/src/store/useAuthStore.js`
**Purpose:** Zustand store for authentication state and Socket.io connection.
```javascript
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";
const baseUrl =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://nextalk-backend-43hu.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  Socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({
        authUser: res.data,
      });
      // Connect to socket if user is authenticated
      get().connectSocket();
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({
        authUser: null,
      });
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  signUp: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({
        authUser: res.data,
      });
      toast.success("Sign up successful!");
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.response?.data?.message || "Sign up failed");
    } finally {
      set({
        isSigningUp: false,
      });
    }
  },

  logIn: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({
        authUser: res.data,
      });
      toast.success("Logged in successfully!");
      get().connectSocket();
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logOut: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully!");
      get().disconnectSocket();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response?.data?.message || "Log out failed");
    }
  },

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", formData);
      set({
        authUser: res.data,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({
        isUpdatingProfile: false,
      });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    // Don't proceed if no user or socket already connected
    if (!authUser || get().Socket?.connected) return;
    
    // Add a small delay to ensure authentication is fully processed
    setTimeout(() => {
      const socket = io(baseUrl, {
        query: { userId: authUser._id },
        transports: ["websocket", "polling"], // Allow fallback to polling if WebSocket fails
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      // Set up socket event handlers
      socket.on("connect", () => {
        set({ Socket: socket });
      });
      
      socket.on("connect_error", () => {
        // Try to reconnect after error
        setTimeout(() => get().connectSocket(), 3000);
      });
      
      socket.on("getOnlineUsers", (onlineUsersIds) => {
        set({ onlineUsers: onlineUsersIds });
      });
      
      // Attempt to connect
      socket.connect();
      set({ Socket: socket });
    }, 500);
  },
  disconnectSocket: () => {
    const { Socket } = get();
    if (Socket) {
      Socket.disconnect();
      set({ Socket: null });
    }
  },
}));
```

### `frontend/src/store/useChatStore.js`
**Purpose:** Zustand store for chat messages and user selection.
```javascript
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().Socket;
    if (!socket) {
      // Attempt to reconnect the socket
      useAuthStore.getState().connectSocket();
      
      // Retry after a short delay if user is authenticated
      if (useAuthStore.getState().authUser) {
        setTimeout(() => {
          get().subscribeToMessages();
        }, 2000);
      }
      return;
    }
    
    socket.on("newMessage", (newMessage) => {
      //optimise
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().Socket;
    if (!socket) {
      return;
    }
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
```

### `frontend/src/store/useThemeStore.js`
**Purpose:** Zustand store for theme management.
```javascript
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "Autumn",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
```

### `frontend/src/pages/HomePage.jsx`
**Purpose:** Main chat interface.
```javascript
import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
```

### `frontend/src/components/ChatContainer.jsx`
**Purpose:** Container for the chat window (header, messages, input).
```javascript
import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
const ChatWindow = () => {
  const {
    selectedUser,
    messages,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-auto ">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? " chat-end" : " chat-start"
            }`}
            ref={messagesEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1 ">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatWindow;
```

## 4. Application Flow

### 1. Authentication Flow
1.  **User Signup/Login**: The user submits credentials via `SignUpPage` or `LoginPage`.
2.  **Backend Processing**: `auth.controller.js` validates input, hashes password (signup), or compares hash (login).
3.  **Token Issuance**: A JWT is generated and sent as an HTTP-only cookie (`jwt`).
4.  **State Update**: Frontend `useAuthStore` updates `authUser` state.

### 2. Real-time Connection
1.  **Connection Init**: Upon successful authentication, `useAuthStore` calls `connectSocket()`.
2.  **Socket Handshake**: The client connects to the Socket.io server, passing the `userId` in the query.
3.  **User Mapping**: The backend (`socket.js`) maps `userId` to `socket.id` in `userSocketMap`.
4.  **Online Status**: The backend broadcasts `getOnlineUsers` event to all clients with the updated list of online users.

### 3. Messaging Flow
1.  **Selection**: User selects a contact from the `Sidebar`. `useChatStore` sets `selectedUser`.
2.  **Fetching History**: `ChatContainer` triggers `getMessages(selectedUser._id)`, fetching chat history from the backend.
3.  **Sending Message**:
    *   User types in `MessageInput` and hits send.
    *   `useChatStore.sendMessages` calls the backend API (`/api/messages/send/:id`).
    *   **Backend**: Saves the message to MongoDB. Checks if the receiver is online using `getReceiverSocketId`.
    *   **Real-time Delivery**: If online, the backend emits `newMessage` to the receiver's specific socket ID.
4.  **Receiving Message**:
    *   The receiver's `useChatStore` is listening for `newMessage`.
    *   If the message is from the currently selected user, it's appended to the `messages` state immediately.

### 4. Image Upload
1.  **Selection**: User selects an image in `MessageInput`.
2.  **Preview**: `FileReader` shows a local preview.
3.  **Upload**: When sending, the base64 image is sent to the backend.
4.  **Cloudinary**: Backend uploads the image to Cloudinary and stores the URL in the message document.



###File Structure
```
Nextalk/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── message.controller.js
│   │   ├── lib/
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   ├── db-optimized.js
│   │   │   ├── socket.js
│   │   │   └── utils.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── message.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── health.route.js
│   │   │   └── message.route.js
│   │   └── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── skeletons/
│   │   │   ├── AuthImagePattern.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── constants/
│   │   │   └── index.js
│   │   ├── lib/
│   │   │   ├── axios.js
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── store/
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useThemeStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
├── README.md
└── documentation.md
```