import { useThemeStore } from "../store/useThemeStore";
import { Send, Eye, Moon, Sun, ShieldCheck, Bell } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Check out this new theme!", isSent: false },
  { id: 2, content: "Looks amazing! Very clean and modern.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-20 px-4 pb-12 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Manage your NexTalk preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Settings Groups */}
          <div className="space-y-8">
            
            {/* Appearance Group */}
            <section className="space-y-3">
              <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-4 tracking-wide uppercase">
                Appearance
              </label>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500">
                      <Sun className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Light Mode</span>
                  </div>
                  <button 
                    onClick={() => setTheme('light')}
                    className={`size-6 rounded-full border-2 transition-all flex items-center justify-center ${theme === 'light' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {theme === 'light' && <div className="size-2 bg-white rounded-full" />}
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500">
                      <Moon className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                  </div>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`size-6 rounded-full border-2 transition-all flex items-center justify-center ${theme === 'dark' ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {theme === 'dark' && <div className="size-2 bg-white rounded-full" />}
                  </button>
                </div>
              </div>
            </section>

            {/* Privacy & Security Group */}
            <section className="space-y-3">
              <label className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 ml-4 tracking-wide uppercase">
                Privacy & Security
              </label>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500">
                      <ShieldCheck className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">End-to-End Encryption</span>
                  </div>
                  <span className="text-xs font-bold text-green-500">ACTIVE</span>
                </div>
                
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500">
                      <Bell className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
                  </div>
                  <span className="text-sm text-gray-400">Enabled</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Interactive Device Preview */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <Eye className="size-5 text-blue-500" strokeWidth={2} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Interface Preview</h2>
            </div>

            <div className="relative rounded-[3rem] border-[10px] border-gray-900 dark:border-[#3A3A3C] shadow-2xl overflow-hidden bg-white dark:bg-black h-[500px] transition-all">
              {/* Mock Chat Header */}
              <div className="px-4 py-4 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    JD
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] dark:text-white leading-none">John Doe</h3>
                    <p className="text-[11px] text-blue-500 font-bold mt-1 uppercase tracking-tighter">Delivered</p>
                  </div>
                </div>
              </div>

              {/* Mock Chat Body */}
              <div className="p-4 space-y-3 h-[320px] overflow-y-auto bg-[#F2F2F7] dark:bg-black transition-colors duration-500">
                {PREVIEW_MESSAGES.map((m) => (
                  <div key={m.id} className={`flex ${m.isSent ? "justify-end" : "justify-start"}`}>
                    <div className={`
                      max-w-[80%] px-4 py-2 rounded-2xl text-[15px] shadow-sm leading-snug transition-all
                      ${m.isSent 
                        ? "bg-[#007AFF] text-white rounded-br-sm shadow-blue-500/20" 
                        : "bg-white dark:bg-[#3A3A3C] dark:text-white rounded-bl-sm"}
                    `}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Input Container */}
              <div className="absolute bottom-0 w-full p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-gray-100 dark:bg-[#1C1C1E] rounded-full px-4 py-2 text-[14px] text-gray-400 border border-black/5 dark:border-white/5 font-medium">
                    iMessage
                  </div>
                  <div className="size-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Send size={15} strokeWidth={2.5} className="ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;