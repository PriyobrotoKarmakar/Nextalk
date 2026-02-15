import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((u) => onlineUsers.includes(u._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-100 dark:border-white/10 flex flex-col bg-[#F9F9F9] dark:bg-black transition-all">
      <div className="p-5 space-y-4">
        <h2 className="text-xl font-extrabold tracking-tight hidden lg:block">
          Messages
        </h2>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className={`w-8 h-4.5 rounded-full relative transition-colors duration-200 ${showOnlineOnly ? "bg-[#34C759]" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 size-3.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${showOnlineOnly ? "translate-x-3.5" : ""}`}
              />
            </div>
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">
              Online
            </span>
          </label>
          <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-full">
            {onlineUsers.length - 1} online
          </span>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pb-4 custom-scrollbar">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-all relative
              ${selectedUser?._id === user._id ? "bg-white dark:bg-[#1C1C1E] shadow-sm z-10" : "hover:bg-gray-200/50 dark:hover:bg-white/5"}`}
          >
            {/* Active Indicator Line */}
            {selectedUser?._id === user._id && (
              <div className="absolute left-0 w-1 h-8 bg-[#007AFF] rounded-r-full" />
            )}

            <div className="relative">
              <img
                src={user.profilePic || "/avatar.png"}
                className="size-11 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-[#34C759] rounded-full ring-2 ring-white dark:ring-[#1C1C1E]" />
              )}
            </div>

            <div className="hidden lg:block text-left flex-1 min-w-0">
              <div className="font-bold text-[15px] truncate text-gray-900 dark:text-gray-100 leading-tight">
                {user.fullName}
              </div>
              <div className="text-[13px] text-gray-500 truncate font-medium">
                Click to chat
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
