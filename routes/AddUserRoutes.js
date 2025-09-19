import express from "express";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // Ensure this line is at the top of the file
import { User } from "../models/userModel.js";
import { Grain } from "../models/grainModel.js"; // Import the Grain model
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Assuming User schema is defined
const router = express.Router();


// Add a new user API
// router.post("/addUser", async (req, res) => {
    router.post("/addUser", async (req, res) => {
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
      role: role || "user",
      state,
      district,
      taluka,
    });
  
    try {
      await user.save();
      res.status(201).json({ message: "User added successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error adding user", error });
    }
  });
  

  
// Middleware to verify JWT token
/////////////////// 25-09-2024///////////////////////////////////
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from the Authorization header
  
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
  export default router;