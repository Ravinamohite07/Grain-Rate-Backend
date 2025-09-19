import express from "express";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // Ensure this line is at the top of the file
import User from "../models/userModel.js";
import {
  isSuperAdmin,
  isAdminOrTraderOrDistrbutor,
} from "../middleware/authorization.js"; // Adjust the path if
//import { forgotPassword,resetPassword } from "../controllers/userController.js";
//import {sendMessage}  from "../utils/whatsappService.js";
//import { verifyToken } from "../middleware/authMiddleware.js";
//import { sendEmail } from "../utils/emailService.js";
import multer from 'multer'; // <-- ADD: Import multer
import path from 'path';     // <-- ADD: Import path
import fs from 'fs'; 


// --- START: ADD MULTER CONFIGURATION FOR FILE UPLOADS ---
const storage = multer.diskStorage({
  // Define the destination folder for uploaded files
  destination(req, file, cb) {
    cb(null, 'public/avatars'); // Files will be saved in the 'public/avatars' folder
  },
  // Define the filename to ensure it is unique
  filename(req, file, cb) {
    // Creates a unique filename like: logo-1678886400000.png
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer middleware with the storage configuration
const upload = multer({ storage });
// --- END: MULTER CONFIGURATION ---


// import { Grain } from "../models/grainModel.js"; // Import the Grain model
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Assuming User schema is defined
const router = express.Router();

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

/////////////
// const jwt = require("jsonwebtoken");

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ Add this to attach id and role
//     req.user = {
//       id: decoded.id,
//       role: decoded.role,
//     };

//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Token is not valid" });
//   }
// };
///////////////////////////////////////////////////////////////////////////////////////
router.post("/register", verifyToken, async (req, res) => {
  try {
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
      pincode,
      gstNo,
      alternativeMobileNo,
      country
    } = req.body;

    // Allowed roles (from your schema)
    const validRoles = [
      "superadmin",
      "admin",
      "user",
      "trader",
      "distributor",
      "retailer",
      "farmer",
      "super-user"
    ];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Get creator's info
    const creator = await User.findById(req.user.id);
    if (!creator) {
      return res.status(403).json({ message: "Invalid creator" });
    }

    // Role-based creation check
    if (!User.canCreateUser(creator.role, role)) {
      return res.status(403).json({
        message: `${creator.role} cannot create ${role}`,
      });
    }

    // Email uniqueness check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      phoneNo,
      email,
      role,
      createdBy: creator._id,
      firstName,
      lastName,
      aadharCard,
      panCard,
      business,
      address,
      state,
      district,
      taluka,
      pincode,
      gstNo,
      alternativeMobileNo,
      country
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});
// // Login route with JWT token creation
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(400).json({ message: "User not found" });
//   }

//   // Check if the user's status is 'accepted' before allowing login
//   if (user.status !== "accepted") {
//     return res.status(403).json({ message: "User account is not accepted" });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return res.status(400).json({ message: "Invalid password" });
//   }

//   // Create JWT token
//   const token = jwt.sign(
//     { id: user._id, role: user.role }, // Payload with user id and role
//     JWT_SECRET, // Secret key
//     { expiresIn: "1h" } // Token expiration time
//   );

//   res.json({
//     message: "Login successful",
//     token, // Send token to the client
//     user: {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       profileImageUrl: user.profileImageUrl, 
//       logoText: user.logoText, 
//     },
//   });
// });
// Login route with JWT token creation
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if the user's status is 'accepted' before allowing login
  if (user.status !== "accepted") {
    return res.status(403).json({ message: "User account is not accepted" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password" });
  }

  // --- THIS IS THE NEW BRANDING LOGIC ---
  let finalLogoUrl = user.profileImageUrl;
  let finalLogoText = user.logoText;
  let adminToQuery = null;

  // If the user has an adminId, we should query that admin for branding.
  // We use the 'createdBy' field as the link, assuming an admin creates their users.
  if (user.role !== 'admin' && user.role !== 'superadmin' && user.createdBy) {
      adminToQuery = user.createdBy;
  }

  if (adminToQuery) {
    // Find the admin user to get the correct branding.
    const adminUser = await User.findById(adminToQuery);
    if (adminUser && adminUser.role === 'admin') {
      finalLogoUrl = adminUser.profileImageUrl; // Use the admin's logo
      finalLogoText = adminUser.logoText;     // Use the admin's text
    }
  }
  // --- END OF NEW LOGIC ---

  // Create JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role }, // Payload with user id and role
    JWT_SECRET, // Secret key
    { expiresIn: "1h" } // Token expiration time
  );

  res.json({
    message: "Login successful",
    token, // Send token to the client
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImageUrl: finalLogoUrl, // Send the correct logo URL
      logoText: finalLogoText,       // Send the correct logo text
    },
  });
});

// Middleware to verify JWT token
///////////////////////////////// 25-09-2024////////////////////////////////////////

// Admin route to get the list of users (Protected)
router.get("/admin/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const users = await User.find({
      createdBy: req.user.id, // Only show users created by the current admin
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user list", error });
  }
});

// Add a new route to get the user count based on their role
router.get("/admin/user-count", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  try {
    const traderCount = await User.countDocuments({
      role: "trader",
      createdBy: req.user.id,
    });
    const distributorCount = await User.countDocuments({
      role: "distributor",
      createdBy: req.user.id,
    });
    const retailerCount = await User.countDocuments({
      role: "retailer",
      createdBy: req.user.id,
    });

    res.status(200).json({
      traderCount,
      distributorCount,
      retailerCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user counts", error });
  }
});

//////////////////// new code /////////////////////////
// const checkAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied. Admins only." });
//   }
//   next();
// };

const checkUserPermission = (req, res, next) => {
  console.log("Checking user permission for role:", req.user?.role);
  const allowedRoles = ["admin", "distributor", "trader"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied." });
  }

  next(); // Allowed role, go ahead
};
// Update user status by ID with token verification and admin check
router.put(
  "/admin/users/:id/status",
  verifyToken,
  //checkAdmin,

  checkUserPermission,
  async (req, res) => {
    const { id } = req.params; // Get user ID from URL parameters
    const { status } = req.body; // Get the new status from the request body

    // Validate the status
    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'accepted' or 'rejected'." });
    }

    try {
      const user = await User.findByIdAndUpdate(id, { status }, { new: true });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res
        .status(200)
        .json({ message: "User status updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Error updating user status", error });
    }
  }
);

///////////////////// add grian routes //////////////////////////////////////////////////////////////

router.post("/addGrain", verifyToken, async (req, res) => {
  const {
    grainName,
    userName,
    minPrice,
    maxPrice,
    districtName,
    talukaName,
    currentDate,
    grainImage,
  } = req.body;

  try {
    const grain = new Grain({
      grainName, // Include grainName
      userName,
      minPrice,
      maxPrice,
      districtName,
      talukaName,
      currentDate: currentDate || Date.now(),
      grainImage,
    });

    await grain.save();
    res
      .status(201)
      .json({ message: "Grain rate and price added successfully", grain });
  } catch (error) {
    res.status(500).json({ message: "Error adding grain data", error });
  }
});

// GET: Get all grain entries
router.get("/addGrain", verifyToken, async (req, res) => {
  try {
    const grains = await Grain.find();
    res.status(200).json(grains);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grain data", error });
  }
});

// GET: Get grain entry by ID
router.get("/addGrain/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const grain = await Grain.findById(id);
    if (!grain) {
      return res.status(404).json({ message: "Grain entry not found" });
    }
    res.status(200).json(grain);
  } catch (error) {
    res.status(500).json({ message: "Error fetching grain data", error });
  }
});

router.put("/addGrain/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    grainName,
    userName,
    minPrice,
    maxPrice,
    districtName,
    talukaName,
    currentDate,
    grainImage,
  } = req.body;

  try {
    const grain = await Grain.findByIdAndUpdate(
      id,
      {
        grainName,
        userName,
        minPrice,
        maxPrice,
        districtName,
        talukaName,
        currentDate,
        grainImage,
      },
      { new: true }
    );

    if (!grain) {
      return res.status(404).json({ message: "Grain entry not found" });
    }
    res
      .status(200)
      .json({ message: "Grain entry updated successfully", grain });
  } catch (error) {
    res.status(500).json({ message: "Error updating grain entry", error });
  }
});

// DELETE: Delete a grain entry by ID
router.delete("/addGrain/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const grain = await Grain.findByIdAndDelete(id);
    if (!grain) {
      return res.status(404).json({ message: "Grain entry not found" });
    }

    res.status(200).json({ message: "Grain entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting grain entry", error });
  }
});

// DELETE: Delete all grain entries (optional)
router.delete("/addGrain", verifyToken, async (req, res) => {
  try {
    await Grain.deleteMany();
    res.status(200).json({ message: "All grain entries deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting grain entries", error });
  }
});

// router.post("/create-admin", verifyToken, isSuperAdmin, async (req, res) => {
//   //console.log("BODY RECEIVED BY SERVER:", req.body);
//   try {
//     const { username, email, password, phoneNo } = req.body;

//     if (!User.canCreateUser(req.user.role, "admin")) {
//       return res
//         .status(403)
//         .json({ message: "You are not allowed to create an admin" });
//     }

//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newAdmin = new User({
//       username,
//       email: email.toLowerCase(),
//       phoneNo,
//       password: hashedPassword,
//       role: "admin",
//       createdBy: req.user._id,
//     });

//     console.log("Saving new admin:", newAdmin);
//     await newAdmin.save();
//     console.log("Admin saved!");

//     //const message = `Hello ${username},\n\nYour admin account has been created successfully.\nLogin with your email and password.`;

//     //await sendMessage(`${phoneNo}@c.us`, message); // assuming you're using whatsapp-web.js

//     res.status(201).json({
//       message: "Admin created successfully.",
//     });
//   } catch (error) {
//     console.error("Error creating admin:", error.message, error);
//     res
//       .status(500)
//       .json({ message: "Error creating admin", error: error.message });
//   }
// });
router.post("/create-admin", verifyToken, isSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    // --- MODIFIED: Get logoText from req.body ---
    const { username, email, password, phoneNo, logoText } = req.body;

    // Multer makes the uploaded file's info available in `req.file`.
    // If no file was uploaded, `req.file` will be undefined.
    if (!req.file) {
      return res.status(400).json({ message: "Logo image is required." });
    }

    // Your existing permission check is preserved
    if (!User.canCreateUser(req.user.role, "admin")) {
      return res
        .status(403)
        .json({ message: "You are not allowed to create an admin" });
    }

    // Your existing user check is preserved
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Best practice: If validation fails, delete the file that was just uploaded.
      fs.unlinkSync(req.file.path); 
      return res.status(400).json({ message: "Email already exists" });
    }

    // Your password hashing is preserved
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- ADDED: Create the public URL for the newly saved image ---
    //const logoUrl = `${req.protocol}://${req.get('host')}/avatars/${req.file.filename}`;
    const logoUrl = `http://192.168.1.41:2872/avatars/${req.file.filename}`;

    // --- MODIFIED: Add the new fields when creating the new User document ---
    const newAdmin = new User({
      username,
      email: email.toLowerCase(),
      phoneNo,
      password: hashedPassword,
      role: "admin",
      createdBy: req.user._id,
      profileImageUrl: logoUrl, // Save the public URL of the logo
      logoText: logoText,       // Save the company name from the form
    });

    console.log("Saving new admin:", newAdmin);
    await newAdmin.save();
    console.log("Admin saved!");

    res.status(201).json({
      message: "Admin created successfully.",
    });
  } catch (error) {
    console.error("Error creating admin:", error.message, error);
    // If any other error happens after the file is uploaded, we should still delete it.
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res
      .status(500)
      .json({ message: "Error creating admin", error: error.message });
  }
});

router.put(
  "/admins/:id/status",
  verifyToken,             
  isSuperAdmin,         
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'." });
      }
      // Find the user that the SuperAdmin wants to update.
      const userToUpdate = await User.findById(id);

      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ensure that this user is actually an admin.
      if (userToUpdate.role !== 'admin') {
        return res.status(403).json({ 
          message: "Access denied. This route can only be used to change the status of Admin users." 
        });
      }
      
      // If the user is an admin, proceed with the update.
      userToUpdate.status = status;
      await userToUpdate.save();


      res.status(200).json({ message: "Admin status updated successfully", user: userToUpdate });
    } catch (error) {
      console.error("Error updating admin status:", error);
      res.status(500).json({ message: "Error updating admin status" });
    }
  }
);


// Create Other Users (Admin Only)
// router.post(
//   "/create-user",
//   verifyToken,
//   isAdminOrTraderOrDistrbutor,
//   async (req, res) => {
//     try {
//       const {
//         username,
//         email,
//         password,
//         phoneNo,
//         role,
//         firstName,
//         lastName,
//         aadharCard,
//         panCard,
//         business,
//         address,
//         state,
//         district,
//         taluka,
//       } = req.body;

//       // Prevent creation of SuperAdmin
//       if (role === "superadmin") {
//         return res
//           .status(403)
//           .json({ message: "You cannot create a SuperAdmin" });
//       }

//       // Check if the email is already registered
//       let existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ message: "Email already exists" });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Create new user with all required fields
//       const newUser = new User({
//         username,
//         email,
//         password: hashedPassword,
//         phoneNo,
//         role,
//         firstName,
//         lastName,
//         aadharCard,
//         panCard,
//         business,
//         address,
//         state,
//         district,
//         taluka,
//         createdBy: req.user.id, // Ensure admin ID is saved as creator
//       });

//       await newUser.save();
//       res.status(201).json({ message: "User created successfully" });
//     } catch (error) {
//       console.error("Error creating user:", error);
//       res.status(500).json({ message: "Error creating user", error });
//     }
//   }
// );

router.post(
  "/create-user",
  verifyToken,
  isAdminOrTraderOrDistrbutor,
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        phoneNo,
        role,
        firstName,
        lastName,
        aadharCard,
        panCard,
        business,
        address,
        state,
        district,
        taluka,
        pincode,
        gstNo,
        alternativeMobileNo,
        country,
      } = req.body;

      //Prevent creation of superadmin
      if (role === "superadmin") {
        return res
          .status(403)
          .json({ message: "You cannot create a SuperAdmin" });
      }

      //Check if creator is allowed to create this role
      const canCreate = User.canCreateUser(req.user.role, role);
      if (!canCreate) {
        return res.status(403).json({
          message: `As a ${req.user.role}, you cannot create a user with role ${role}`,
        });
      }

      //Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      //Create user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        phoneNo,
        role,
        firstName,
        lastName,
        aadharCard,
        panCard,
        business,
        address,
        state,
        district,
        taluka,
        pincode,
        gstNo,
        alternativeMobileNo,
        country,
        createdBy: req.user.id, // Logged-in user's ID
      });

      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user", error: error.message });
    }
  }
);

// Middleware to check for roles
export const verifyRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Access denied. Insufficient privileges." });
  }
  next();
};

//Define route after middleware
// router.get("/getAdmins", verifyToken, verifyRole(["superadmin"]), async (req, res) => {
//   try {
//     const admins = await User.find({ role: "admin" }).select("username email phoneNo"); // Removed password, added username
//     res.status(200).json(admins);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching admins" });
//   }
// });

router.get("/superadmin/admins", verifyToken, async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res
      .status(403)
      .json({ message: "Access denied. SuperAdmins only." });
  }

  try {
    const admins = await User.find({ role: "admin" });
    res.status(200).json(admins); // <-- changed line
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error });
  }
});

router.delete(
  "/deleteAdmin/:id",
  verifyToken,
  verifyRole(["superadmin"]),
  async (req, res) => {
    try {
      const deletedAdmin = await User.findByIdAndDelete(req.params.id);
      if (!deletedAdmin)
        return res.status(404).json({ message: "Admin not found" });
      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting admin", error });
    }
  }
);

// Update Admin
router.put(
  "/updateAdmin/:id",
  verifyToken,
  verifyRole(["superadmin"]),
  async (req, res) => {
    console.log("Update request received with ID:", req.params.id);
    console.log("Request body:", req.body);
    console.log("User role:", req.user?.role);
    console.log("User ID:", req.user?.id); // Check if token is parsed correctly

    try {
      const updatedAdmin = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedAdmin) {
        console.log("Admin not found for ID:", req.params.id);
        return res.status(404).json({ message: "Admin not found" });
      }
      console.log("Admin updated successfully:", updatedAdmin);
      res
        .status(200)
        .json({ message: "Admin updated successfully", updatedAdmin });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ message: "Error updating admin", error });
    }
  }
);

router.get("/superadmin/admin-count", verifyToken, async (req, res) => {
  try {
    // Ensure only super admins can access this
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Superadmins only." });
    }

    // Count users with the role "admin"
    const adminCount = await User.countDocuments({ role: "admin" });

    res.status(200).json({ count: adminCount });
  } catch (error) {
    console.error("Error fetching admin count:", error);
    res.status(500).json({ message: "Error fetching admin count", error });
  }
});

router.get("/user-count", verifyToken, async (req, res) => {
  try {
    // Filter only users created by the currently logged-in admin
    const allUsers = await User.find({ createdBy: req.user.id });

    const count = {
      totalUsers: allUsers.length,
      farmers: allUsers.filter((u) => u.role === "farmer").length,
      traders: allUsers.filter((u) => u.role === "trader").length,
      distributors: allUsers.filter((u) => u.role === "distributor").length,
      retailers: allUsers.filter((u) => u.role === "retailer").length,
    };

    res.status(200).json(count);
  } catch (error) {
    console.error("Error getting user counts:", error);
    res
      .status(500)
      .json({ message: "Server error while getting user counts." });
  }
});

router.get("/my-users", verifyToken, async (req, res) => {
  const allowedRoles = ["trader", "distributor"];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Not authorized." });
  }

  try {
    const users = await User.find({ createdBy: req.user.id });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

////////////////////////////////////////////18/9/2025/////////////////////////////////////////////////////
router.get("/user-analytics", verifyToken, async (req, res) => {
  try {
    // Get all users created by the logged-in admin
    const allUsers = await User.find({ createdBy: req.user.id });

    const totalUsers = allUsers.length;

    // Count each role
    const farmers = allUsers.filter((u) => u.role === "farmer").length;
    const traders = allUsers.filter((u) => u.role === "trader").length;
    const distributors = allUsers.filter((u) => u.role === "distributor").length;
    const retailers = allUsers.filter((u) => u.role === "retailer").length;

    // Calculate percentage for each role (rounded to 1 decimal)
    const percentage = (count) => totalUsers === 0 ? 0 : parseFloat(((count / totalUsers) * 100).toFixed(1));

    const response = {
      totalUsers,
      farmers,
      traders,
      distributors,
      retailers,
      percentages: {
        farmers: percentage(farmers),
        traders: percentage(traders),
        distributors: percentage(distributors),
        retailers: percentage(retailers),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting user counts:", error);
    res.status(500).json({ message: "Server error while getting user counts." });
  }
});

/////////////////////////////////14/8/2025//////////////////////////////////////////////////////

// router.get("/me", verifyToken, async (req, res) => {
//   try {
//     // The user's ID is attached to the request object by the verifyToken middleware.
//     // Ensure the key ('userId') matches what you set in your JWT payload.
//     const userId = req.user.userId;
//     // Find the user by their ID and populate the 'createdBy' field.
//     // This will show who created this user, which might be useful on their dashboard.
//     const user = await User.findById(userId).populate(
//       "createdBy",
//       "username email business"
//     );
//     // If for some reason the user from the token doesn't exist in the DB (e.g., deleted).
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     // Return all the user's information.
//     res.status(200).json(user);

//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ message: "Error fetching user profile." });
//   }
// });

///////////////////////////////////14/8/2025////////////////////////////////////////////////////////
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate(
      "createdBy",
      "username email business"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile." });
  }
});

/**
 * @route   PATCH /api/users/me
 * @desc    Update the profile of the currently logged-in user
 * @access  Private
 */
router.patch("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // We create an object with only the fields we want to allow for updates.
    const allowedUpdates = [
      "firstName", "lastName", "phoneNo", "business", "address", 
      "state", "district", "taluka", "pincode", "gstNo", 
      "alternativeMobileNo", "country", "aadharCard", "panCard"
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    // Find the user by their ID and update the allowed fields.
    // { new: true } returns the modified document rather than the original.
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Error updating user profile." });
  }
});

/**
 * @route   PATCH /api/users/me/password
 * @desc    Change the password for the currently logged-in user
 * @access  Private
 */
router.patch("/me/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 1. Basic validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both the current and new password." });
    }
    
    // 2. Get the user from the database (we need the full document to access the stored password)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Compare the provided currentPassword with the one stored in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    // 4. Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password and save
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password." });
  }
});

// // Helper function to generate a reset token
// const generateResetToken = (userId) => {
//   return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Token valid for 1 hour
// };
// // router.post("/forgot-password", forgotPassword);
// // router.post("/reset-password/:token", resetPassword);
// // @route   POST /api/auth/forgot-password
// // @desc    Request a password reset link
// // @access  Public
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1) Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "Email not found" });
//     }

//     // 2) Generate a password reset token
//     const resetToken = generateResetToken(user._id);

//     // 3) Create the reset link using the frontend URL
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//     // 4) Send the reset email to the user
//     await sendEmail(user.email, "Password Reset Request", `Please click on the following link to reset your password: ${resetLink}`);

//     res.status(200).json({ message: "Password reset link sent to your email." , token: resetToken});
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     res.status(500).json({ message: "Server error during forgot password request." });
//   }
// });

// // @route   POST /api/auth/reset-password/:token
// // @desc    Reset user's password with a valid token
// // @access  Public
// router.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     // Basic validation
//     if (!token) {
//       return res.status(400).json({ message: "Reset token is missing." });
//     }
//     if (!newPassword || newPassword.length < 6) { // Example: minimum password length
//       return res.status(400).json({ message: "New password must be at least 6 characters long." });
//     }

//     // 1) Verify the reset token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 2) Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // 3) Find the user by ID from the token and update their password
//     const user = await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword }, { new: true });

//     if (!user) {
//       return res.status(404).json({ message: "User not found or token invalid." });
//     }

//     res.status(200).json({ message: "Password updated successfully." });
//   } catch (error) {
//     console.error("Reset Password Error:", error);
//     if (error.name === 'TokenExpiredError') {
//       return res.status(400).json({ message: "Password reset token has expired." });
//     }
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(400).json({ message: "Invalid password reset token." });
//     }
//     res.status(500).json({ message: "Server error during password reset." });
//   }
// });

export default router;
