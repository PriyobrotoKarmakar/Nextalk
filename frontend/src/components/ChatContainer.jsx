import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Languages, Loader2 } from "lucide-react";

const ChatContainer = () => {
  const {
    selectedUser,
    messages,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    translateMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const [translatingId, setTranslatingId] = useState(null);
  const [openTranslateMenu, setOpenTranslateMenu] = useState(null);

  const languages = [
    "English",
    "Bengali",
    "Hindi",
    "Japanese",
    "Spanish",
    "French",
    "German",
  ];

  const handleTranslate = async (messageId, text, lang) => {
    setOpenTranslateMenu(null);
    setTranslatingId(messageId);
    const translatedText = await translateMessage(text, lang);

    const messageIndex = messages.findIndex((m) => m._id === messageId);
    if (messageIndex !== -1) {
      messages[messageIndex].text = translatedText;
    }
    setTranslatingId(null);
  };

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
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

  if (isMessagesLoading) return <MessageSkeleton />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
        {messages.map((message, index) => {
          const isMe = message.senderId === authUser._id;
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          const isFirstOfGroup =
            !prevMessage || prevMessage.senderId !== message.senderId;
          const isLastOfGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;

          // Smart position: If message is in the first 3, open menu downwards
          const openDownwards = index < 3;

          return (
            <div key={message._id} className="flex flex-col group">
              {isFirstOfGroup && (
                <span className="text-[11px] font-semibold text-gray-400 self-center my-3 uppercase tracking-wider">
                  {formatMessageTime(message.createdAt)}
                </span>
              )}

              <div
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"} items-center gap-2`}
              >
                {/* Left Side (For Sent Messages) */}
                {isMe && message.text && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenTranslateMenu(
                          openTranslateMenu === message._id
                            ? null
                            : message._id,
                        )
                      }
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 opacity-100"
                    >
                      {translatingId === message._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Languages className="size-3.5" />
                      )}
                    </button>

                    {openTranslateMenu === message._id && (
                      <div
                        className={`absolute ${openDownwards ? "top-8" : "bottom-8"} right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-1 w-32 animate-in fade-in zoom-in duration-200`}
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() =>
                              handleTranslate(message._id, message.text, lang)
                            }
                            className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`flex max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2`}
                >
                  {!isMe && (
                    <div className="size-7 flex-shrink-0">
                      {isLastOfGroup ? (
                        <img
                          src={selectedUser.profilePic || "/avatar.png"}
                          className="size-full rounded-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="size-full" />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-[15px] shadow-sm relative leading-snug break-all whitespace-pre-wrap
                      ${isMe ? "bg-[#007AFF] text-white rounded-br-sm" : "bg-[#E9E9EB] dark:bg-[#3A3A3C] text-black dark:text-white rounded-bl-sm"}`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          className="max-w-[200px] rounded-lg mb-1"
                          alt=""
                        />
                      )}
                      {message.text && <p>{message.text}</p>}
                    </div>
                  </div>
                </div>

                {/* Right Side (For Received Messages) */}
                {!isMe && message.text && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenTranslateMenu(
                          openTranslateMenu === message._id
                            ? null
                            : message._id,
                        )
                      }
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-400 opacity-100"
                    >
                      {translatingId === message._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Languages className="size-3.5" />
                      )}
                    </button>
                    {openTranslateMenu === message._id && (
                      <div
                        className={`absolute ${openDownwards ? "top-8" : "bottom-8"} left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-1 w-32 animate-in fade-in zoom-in duration-200`}
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() =>
                              handleTranslate(message._id, message.text, lang)
                            }
                            className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="h-2" ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
