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
        const {text, image} = req.body;
        const {id: recieverId} = req.params;
        const senderId = req.user._id;
        let imageUrl = null;
        if(image){
            const uploadResponse  = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image: imageUrl
        })
        await newMessage.save();
        //real time functionaly when socket io will be done

        const receiverSocketId = getReceiverSocketId(recieverId);
        if (receiverSocketId) {//if user is online
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};