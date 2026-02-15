import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Image, Send, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="w-full p-2 pb-6 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 transition-all">
      {/* Image Preview Floating Card */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 px-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 
              flex items-center justify-center hover:scale-110 transition-transform shadow-md"
              type="button"
            >
              <X className="size-3.5 text-gray-600 dark:text-gray-200" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 px-2">
        {/* File Upload Button - iOS style gray icon */}
        <div className="pb-2">
           <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`p-2 rounded-full transition-colors ${
              imagePreview ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* The "iMessage" Pill Input */}
        <div className="flex-1 relative">
           <input
            type="text"
            className="w-full h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1C1C1E] px-4 py-2 text-[15px] focus:outline-none focus:border-gray-300 dark:focus:border-gray-600 transition-all placeholder:text-gray-400 dark:text-white"
            placeholder="iMessage"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        {/* Send Button - Pops into a Blue Circle when active */}
        <div className="pb-1">
           <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className={`
              size-8 flex items-center justify-center rounded-full transition-all duration-200
              ${(!text.trim() && !imagePreview) 
                ? 'bg-gray-200 text-gray-400 cursor-default scale-90 dark:bg-gray-800 dark:text-gray-600' 
                : 'bg-[#007AFF] text-white shadow-md hover:bg-[#006BE0] scale-100'
              }
            `}
          >
            <Send size={16} strokeWidth={2.5} className={(!text.trim() && !imagePreview) ? "ml-0" : "ml-0.5"} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;