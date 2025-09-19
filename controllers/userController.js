import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  User  from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// import { User } from "../models/User";
//import { sendEmail } from "../utils/emailService.js";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const router = express.Router();
// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    req.user = decoded; // Attach decoded user information to the request
    next(); // Proceed to the next middleware/route
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check for roles
export const verifyRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Access denied. Insufficient privileges." });
  }
  next();
};

// Add a new user API
router.post("/addUser", verifyToken, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    aadharCard,
    panCard,
    business,
    address,
    username,
    password,
    role,
    state,
    district,
    taluka,
  } = req.body;

  try {
    // const creatorRole = req.user.role;
    // const creatorId = req.user.id;

    // // Check permission
    // if (!User.canCreateUser(creatorRole, role)) {
    //   return res.status(403).json({ message: `You are not allowed to create a user with role '${role}'` });
    // }
    // Check permission to create the requested role
    const creatorRole = req.user.role;
    const newUserRole = role || "user";

    if (!User.canCreateUser(creatorRole, newUserRole)) {
      return res
        .status(403)
        .json({
          message: `As a ${creatorRole}, you cannot create a ${newUserRole}.`,
        });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      phoneNo,
      aadharCard,
      panCard,
      business,
      address,
      username,
      password: hashedPassword,
      role: newUserRole,
      state,
      district,
      taluka,
      createdBy: req.user.userId, // Assign who created the user
    });
    

    await user.save();
    res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error adding user", error });
  }
});

// GET all users (admin only)
router.get("/getUsers", verifyToken, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "trader" || req.user.role === "distributor") {
      filter = { createdBy: req.user.id };
    }

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

// GET a user by ID
router.get("/getUser/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

// UPDATE user details by ID
router.put("/updateUser/:id", verifyToken, async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    address,
    username,
    role,
    state,
    district,
    taluka,
  } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phoneNo,
        address,
        username,
        role,
        state,
        district,
        taluka,
      },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});

// DELETE a user by ID
router.delete(
  "/deleteUser/:id",
  verifyToken,
  verifyRole(["admin"]),
  async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ message: "User not found" });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
);

// router.get("/my-users", verifyToken, async (req, res) => {
//   try {
//     const users = await User.find({ createdBy: req.user.id });
//     res.status(200).json({ users });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error });
//   }
// });

// const generateResetToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
// };

// // Forgot Password
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1) Find user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Email not found" });

//     // 2) Generate reset token
//     const resetToken = generateResetToken(user._id);

//     // 3) Prepare reset link
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // 4) Send email
//     await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);

//     res.json({ message: "Password reset link sent to email" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Reset Password
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     // 1) Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 2) Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // 3) Update user password
//     await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };
// Generate Token
// const generateResetToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // 1 hour for testing
// };

// // Forgot Password
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1) Find user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "Email not found" });

//     // 2) Generate reset token
//     const resetToken = generateResetToken(user._id);

//     // 3) Prepare reset link (Frontend link for email)
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // 4) Send email with reset link
//     await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);

//     return res.json({ message: "Password reset link sent to email", token: resetToken }); // helpful for Postman testing
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Reset Password
// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params; // <-- Make sure route has /reset-password/:token
//     const { newPassword } = req.body;

//     if (!token) return res.status(400).json({ message: "Token missing" });

//     // 1) Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 2) Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // 3) Update user password
//     await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

//     return res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Reset Password Error:", error);
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }
// };


export default router;
