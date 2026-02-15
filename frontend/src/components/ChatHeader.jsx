import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";




const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-white/75 dark:bg-black/75 backdrop-blur-xl sticky top-0 z-20 saturate-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={selectedUser.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover border border-black/5" />
            {isOnline && <span className="absolute bottom-0 right-0 size-2.5 bg-[#34C759] rounded-full ring-2 ring-white dark:ring-black"></span>}
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-black dark:text-white tracking-tight leading-tight">{selectedUser.fullName}</h3>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-tighter">{isOnline ? "Active" : "Offline"}</p>
          </div>
        </div>
        <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-90">
          <X className="size-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;