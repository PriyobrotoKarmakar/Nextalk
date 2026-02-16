import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Image, Send, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);

  const fileInputRef = useRef(null);
  const { sendMessages, rewriteText } = useChatStore();

  const tones = ["Fix Grammar", "Professional", "Casual", "Funny", "Friendly"];

  const handleRewrite = async (tone) => {
    if (!text.trim()) return;
    setIsRewriting(true);
    setShowToneMenu(false);

    const newText = await rewriteText(text, tone);
    setText(newText);
    setIsRewriting(false);
    toast.success(`Rewritten to ${tone} tone! ✨`);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSending) return; // Prevent double send

    setIsSending(true);
    try {
      await sendMessages({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full p-2 pb-6 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 transition-all relative">
      {/* Tone Selection Menu (iOS Context Menu Style) */}
      {showToneMenu && (
        <div className="absolute bottom-20 left-4 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col gap-1">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => handleRewrite(tone.toLowerCase())}
                className="px-4 py-2 text-sm font-semibold text-left rounded-xl hover:bg-blue-500 hover:text-white transition-colors dark:text-gray-200 dark:hover:bg-blue-600 dark:hover:text-white"
              >
                {tone}
              </button>
            ))}
          </div>
        </div>
      )}

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
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
            >
              <X className="size-3.5 text-gray-600 dark:text-gray-200" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2 px-2">
        <div className="pb-2 flex items-center gap-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {/* Magic Rewrite Button */}
          <button
            type="button"
            disabled={!text.trim() || isRewriting}
            onClick={() => setShowToneMenu(!showToneMenu)}
            className={`p-2 rounded-full transition-all ${
              isRewriting
                ? "animate-spin text-blue-500"
                : "text-gray-400 hover:text-blue-500 disabled:opacity-30"
            }`}
          >
            {isRewriting ? (
              <Loader2 size={22} />
            ) : (
              <Sparkles size={22} strokeWidth={2} />
            )}
          </button>

          <button
            type="button"
            className={`p-2 rounded-full transition-colors ${imagePreview ? "text-blue-500" : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1C1C1E]">
          <textarea
            className="w-full bg-transparent px-4 py-3 text-[15px] focus:outline-none transition-all dark:text-white resize-none max-h-32 overflow-y-auto custom-scrollbar block"
            placeholder={isRewriting ? "AI is thinking..." : "iMessage"}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Auto-resize
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={1}
            disabled={isRewriting || isSending}
            style={{ minHeight: "2.5rem" }}
          />
        </div>

        <div className="pb-3">
          <button
            type="submit"
            disabled={(!text.trim() && !imagePreview) || isSending}
            className={`size-8 flex items-center justify-center rounded-full transition-all duration-200 ${
              !text.trim() && !imagePreview
                ? "bg-gray-200 text-gray-400 scale-90 dark:bg-gray-800"
                : "bg-[#007AFF] text-white shadow-md scale-100"
            } ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2.5} className="ml-0.5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
