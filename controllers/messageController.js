import Message from "../models/Message.js";
import { getIo } from "../socket.js"; // Import WebSocket instance


// Function to send a message
// export const sendMessage = async (req, res) => {
//   try {
//     const { title, content } = req.body;

//     if (!title || !content) {
//       return res.status(400).json({ error: "Title and content are required" });
//     }

//     // Save message to database
//     const message = new Message({ title, content });
//     await message.save();

//     // Emit message to all connected users via WebSocket
//     getIo().emit("newMessage", { title, content });

//     return res.status(200).json({ success: true, message: "Message sent successfully" });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
// 
// Send a message
export const sendMessage = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { title, content, userTypes } = req.body;

    if (!title || !content || !userTypes || !Array.isArray(JSON.parse(userTypes))) {
      return res.status(400).json({
        error: "Title, content, and userTypes (array) are required",
      });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const message = new Message({
      title,
      content,
      userTypes: JSON.parse(userTypes),
      image: imageUrl,
    });

    await message.save();

    // Emit message to all connected users via WebSocket
    getIo().emit("newMessage", { title, content, userTypes, image: imageUrl });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// // Function to fetch all messages (for offline users)
// export const getMessages = async (req, res) => {
//   try {
//     const messages = await Message.find().sort({ createdAt: -1 });
//     return res.status(200).json({ success: true, messages });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

//only end user to get messages created for them
export const getMessages = async (req, res) => {
  try {
    // Assume you are passing userType in query or from logged-in user info
    const { userType } = req.query; // e.g. ?userType=Farmer

    if (!userType) {
      return res.status(400).json({ error: "userType is required" });
    }

    // Find messages where userTypes array contains the given userType
    const messages = await Message.find({ userTypes: userType }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

