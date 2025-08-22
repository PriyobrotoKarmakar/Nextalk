import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { getUsersForSidebar,getMessages,sendMessages } from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", isAuthenticated, getUsersForSidebar);
router.get("/:id", isAuthenticated, getMessages);
router.post("/send/:id", isAuthenticated, sendMessages);
export default router;