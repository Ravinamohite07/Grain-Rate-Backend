import express from "express";
import  { sendMessage }  from "../utils/whatsappService.js"; // ✅ Import WhatsApp Service

const router = express.Router();

// ✅ Route to send WhatsApp messages
router.post("/", async (req, res) => {
  try {
    const { phoneNumber, message, url, date } = req.body;

    // Validate required fields
    if (!phoneNumber || !message || !url || !date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Send WhatsApp message
    const result = await sendMessage(phoneNumber, message, url.replace("//", "/"), date);

    if (result.success) {
      res.status(200).json({ message: "WhatsApp message sent successfully" });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error("Error in /api/whatsapp route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

