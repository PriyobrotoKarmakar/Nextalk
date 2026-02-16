import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          recieverId: userToChatId,
        },
        {
          senderId: userToChatId,
          recieverId: myId,
        },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;
    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    //real time functionaly when socket io will be done

    const receiverSocketId = getReceiverSocketId(recieverId);
    if (receiverSocketId) {
      //if user is online
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import Groq from "groq-sdk";

export const rewriteMessage = async (req, res) => {
  try {
    const { text, tone } = req.body;

    // Initialize Groq client
    // WARNING: Ensure GROQ_API_KEY is in .env
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!text || !tone) {
      return res.status(400).json({ message: "Text and tone are required" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that rewrites messages. Rewrite the following message to be more ${tone}. Keep the meaning the same but adjust the tone. Output ONLY the rewritten message, no explanations or quotes.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const rewrittenText = completion.choices[0]?.message?.content || "";

    // Remove any surrounding quotes if present
    const cleanText = rewrittenText.replace(/^["']|["']$/g, "");

    res.status(200).json({ rewrittenText: cleanText });
  } catch (error) {
    console.error("Error rewriting message:", error);
    res.status(500).json({ message: "Failed to rewrite message" });
  }
};

export const translateMessage = async (req, res) => {
  try {
    const { text, language } = req.body;

    // Initialize Groq client
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    if (!text || !language) {
      return res
        .status(400)
        .json({ message: "Text and language are required" });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Translate the following text into ${language}. Do not include any explanations, greetings, or notes. Output only the translated text.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const translatedText = completion.choices[0]?.message?.content || "";

    // Remove any surrounding quotes if present
    const cleanText = translatedText.replace(/^["']|["']$/g, "");

    res.status(200).json({ translatedText: cleanText });
  } catch (error) {
    console.error("Error translating message:", error);
    res.status(500).json({ message: "Failed to translate message" });
  }
};
