// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";
// import User from "./models/userModel.js"; // Ensure correct path

// dotenv.config();

// const hashSuperAdminPassword = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     const existingSuperAdmin = await User.findOne({ role: "superadmin" });

//     if (existingSuperAdmin) {
//       console.log("SuperAdmin already exists.");
//       return;
//     }

//     const hashedPassword = await bcrypt.hash("shrifood", 10); // Set a secure password

//     const superAdmin = new User({
//       username: "shrifood",  // Add username
//       password: hashedPassword,
//       phoneNo: "9999999999",  // Add phone number
//       email: "superadmin@gmail.com", // Use a real email
//       role: "superadmin",
//       status: "accepted",
//     });

//     await superAdmin.save();
//     console.log("SuperAdmin created successfully!");

//     mongoose.connection.close();
//   } catch (error) {
//     console.error("Error hashing password:", error);
//     mongoose.connection.close();
//   }
// };

// hashSuperAdminPassword();
