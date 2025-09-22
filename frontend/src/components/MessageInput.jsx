import React, { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, Image, Send } from "lucide-react";
import toast from "react-hot-toast";
const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessages } = useChatStore();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith("image/")) {
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
    fileInputRef.current.value = null; // Reset the file input
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) {
      toast.error("Please enter a message or select an image.");
      return;
    }
    try {
      await sendMessages({
        text: text.trim(),
        image: imagePreview,
      });
      //clear the form
      setText("");
      setImagePreview(null);
      fileInputRef.current.value = null; // Reset the file input
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };
  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3 cursor-pointer" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            className="flex-1 input input-bordered rounded-lg input-sm sm:input-md focus:outline-none focus:bg-base-200"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle btn-sm flex-shrink-0 cursor-pointer hover:bg-base-300
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={18} />
          </button>
          
          <button
            type="submit"
            className="btn btn-sm btn-circle flex-shrink-0 cursor-pointer hover:bg-base-300"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={18} className={`${(!text.trim() && !imagePreview) ? 'text-zinc-600' : 'text-zinc-400'}`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
