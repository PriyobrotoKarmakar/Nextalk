import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";
const baseUrl =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

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
    if (!authUser || get().Socket?.connected) return;
    const socket = io(baseUrl, {
      query: { userId: authUser._id },
      transports: ["websocket"],
    });
    socket.connect();
    set({ Socket: socket });

    socket.on("getOnlineUsers", (onlineUsersIds) => {
      set({ onlineUsers: onlineUsersIds });
    });
  },
  disconnectSocket: () => {
    const { Socket } = get();
    if (Socket) {
      Socket.disconnect();
      set({ Socket: null });
    }
  },
}));
