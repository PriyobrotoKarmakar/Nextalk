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
