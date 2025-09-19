import express from 'express';
import fs from 'fs';
import path from 'path';
import User from '../models/userModel.js'; // Adjust the path to your user model if necessary

const router = express.Router();

// --- PREDEFINED LIST OF COMPANY NAMES ---
// You can easily add or remove company names from this list.
const LOGO_TEXT_OPTIONS = [
  "Shri Food Processing",
  "Shri Foods",
  "Maruti Agro",
  "Samrudh Feeds",
  "Mauli Group"
];

/**
 * @route   GET /api/avatars
 * @desc    Get a list of all available avatar image URLs
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    // Define the directory where your logo images are stored
    const avatarsDirectory = path.join(process.cwd(), 'public', 'avatars');

    // Read all filenames from the directory
    const filenames = await fs.promises.readdir(avatarsDirectory);

    // Filter for only image files
    const imageFiles = filenames.filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file));

    // Convert filenames into full, public URLs that the frontend can use
    const imageUrls = imageFiles.map(filename => {
      return `${req.protocol}://${req.get('host')}/avatars/${filename}`;
    });

    res.json(imageUrls);
  } catch (error) {
    console.error("Error fetching avatar list:", error);
    res.status(500).send("Server Error");
  }
});


/**
 * @route   GET /api/avatars/logotexts
 * @desc    Get the predefined list of company names (logo texts)
 * @access  Public
 */
router.get("/logotexts", (req, res) => {
  // Simply return the hardcoded list of options
  res.json(LOGO_TEXT_OPTIONS);
});


/**
 * @route   POST /api/avatars/set
 * @desc    Set a user's chosen avatar image AND logo text
 * @access  Private (should be protected with authentication middleware)
 */
router.post(
  "/set",
  // verifyToken, // <-- Uncomment this line if you have auth middleware
  async (req, res) => {
    try {
      // Expecting userId, imageUrl, and logoText from the frontend
      const { userId, imageUrl, logoText } = req.body;

      if (!userId || !imageUrl || !logoText) {
        return res.status(400).json({ message: "User ID, Image URL, and Logo Text are required." });
      }

      // Security check: ensure the submitted text is one of the valid options
      if (!LOGO_TEXT_OPTIONS.includes(logoText)) {
        return res.status(400).json({ message: "Invalid logo text selected."});
      }

      // Find the user in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // --- UPDATE BOTH FIELDS in the user's document ---
      user.profileImageUrl = imageUrl;
      user.logoText = logoText;
      await user.save();

      // Send a success response with the updated user info
      res.json({
        message: "Avatar and text updated successfully!",
        user: {
          id: user._id,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
          logoText: user.logoText, // Send back the updated text
        },
      });
    } catch (error) {
      console.error("Error setting user avatar and text:", error);
      res.status(500).send("Server Error");
    }
  }
);

export default router;