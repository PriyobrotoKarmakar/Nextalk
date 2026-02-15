import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-center pt-16 px-4 transition-colors duration-500">
      {/* Main App Container - Squircle corners and subtle border */}
      <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-6xl h-[calc(100vh-6rem)] border border-black/5 dark:border-white/10 overflow-hidden flex transition-all duration-300">
        
        {/* Sidebar Section */}
        <Sidebar />

        {/* Chat Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white/40 dark:bg-black/20 backdrop-blur-md">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;