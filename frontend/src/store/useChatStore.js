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
      console.error("Socket is null! Trying to reconnect...");
      // Show detailed info for debugging
      console.log("Auth state:", { 
        user: useAuthStore.getState().authUser ? "logged in" : "not logged in",
        baseUrl: baseUrl
      });
      
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
    
    // Debug socket state
    console.log("Socket connected:", socket.connected);
    
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
      console.error("Socket is null when trying to unsubscribe!");
      return;
    }
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
