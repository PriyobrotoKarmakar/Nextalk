import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            {/* Outer Glow/Pulse Effect */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl animate-pulse group-hover:bg-blue-500/30 transition-colors" />
            
            {/* Main Icon Container */}
            <div
              className="relative w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center
              justify-center border border-blue-100 dark:border-blue-800 shadow-sm"
            >
              <MessageSquare className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome back to NexTalk!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
            Select a conversation from the sidebar <br className="hidden sm:block" /> to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;