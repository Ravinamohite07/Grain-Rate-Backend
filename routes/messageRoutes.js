import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import upload from "../middleware/uploadMiddleware.js"; // your existing multer config

const router = express.Router();

// Route to send a message (Admin only)
router.post("/send", sendMessage);
router.post("/send-message", upload.single("image"), sendMessage);

// Route to get all messages (For offline users)
router.get("/", getMessages);

export default router;
