import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { logOut, authUser } = useAuthStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[64px] transition-all duration-300
      bg-white/70 dark:bg-black/70 backdrop-blur-2xl saturate-150 
      border-b border-black/[0.05] dark:border-white/[0.08]
      supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60"
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left Section - Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 transition-all active:scale-95 group"
        >
          <div className="size-10 rounded-[12px] bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-[-4deg] transition-transform">
            <MessageSquare className="w-5.5 h-5.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-[17px] font-extrabold tracking-tight text-black dark:text-white">
              NexTalk
            </h1>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-80">
              Messenger
            </span>
          </div>
        </Link>

        {/* Right Section - Actions */}
        <nav className="flex items-center gap-1">
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition-all
            text-gray-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white
            active:scale-90"
          >
            <Settings className="size-5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />
              
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition-all
                text-gray-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-black dark:hover:text-white
                active:scale-90"
              >
                <div className="size-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-black/5">
                    {authUser.profilePic ? (
                        <img src={authUser.profilePic} alt="Profile" className="size-full object-cover" />
                    ) : (
                        <User className="size-4" strokeWidth={2} />
                    )}
                </div>
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <button
                onClick={logOut}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-semibold transition-all
                text-red-500 hover:bg-red-500/10 active:scale-90"
              >
                <LogOut className="size-5" strokeWidth={1.8} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;