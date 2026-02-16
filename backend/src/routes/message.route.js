import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessages,
  rewriteMessage,
  translateMessage,
} from "../controllers/message.controller.js";
const router = express.Router();

router.get("/users", isAuthenticated, getUsersForSidebar);
router.get("/:id", isAuthenticated, getMessages);
router.post("/send/:id", isAuthenticated, sendMessages);
router.post("/rewrite", isAuthenticated, rewriteMessage);
router.post("/translate", isAuthenticated, translateMessage);

export default router;
