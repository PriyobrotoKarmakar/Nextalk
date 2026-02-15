import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils"; // Assume this returns "9:41 AM"

const ChatWindow = () => {
  const {
    selectedUser,
    messages,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

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

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-black">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black transition-colors">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
        {messages.map((message, index) => {
          const isMe = message.senderId === authUser._id;
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];

          // Show timestamp if it's the first message or a long gap exists
          const isFirstOfGroup =
            !prevMessage || prevMessage.senderId !== message.senderId;
          const isLastOfGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;

          return (
            <div key={message._id} className="flex flex-col">
              {isFirstOfGroup && (
                <span className="text-[11px] font-semibold text-gray-400 self-center my-3 uppercase tracking-wider">
                  {formatMessageTime(message.createdAt)}
                </span>
              )}

              <div
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
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
                      className={`px-4 py-2 rounded-2xl text-[15px] shadow-sm leading-snug break-all whitespace-pre-wrap
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
                    {isMe && index === messages.length - 1 && (
                      <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
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
export default ChatWindow;
