import User from "../models/userModel.js";
import jwt from "jsonwebtoken"; // ✅ Make sure this is present

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const authorizeRoles = (allowedRoles) => { 
  return async (req, res, next) => {
    try {
      const userId = req.user?.id; // Get userId from the authenticated user (if using JWT or similar)

      if (!userId) {
        return res.status(400).json({ message: "User not authenticated." });
      }

      // Fetch user data from the database using userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if the user has the required role
      if (!allowedRoles.includes(user.role)) {
        return res
          .status(403)
          .json({
            message:
              "Access denied. You don't have permission to perform this action.",
          });
      }

      // Allow access to the next middleware or route handler
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res
        .status(500)
        .json({ message: "Server error while checking user role." });
    }
  };
};
export const checkRole = (roles) => {
  return (req, res, next) => {
    const { user } = req; // Assuming the user is attached to the request after authentication

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next(); // Allow access
  } else {
    return res.status(403).json({ message: "Access denied. SuperAdmin only." });
  }
};

// export const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     return res.status(403).json({ message: 'Access denied. Admins only.' });
//   }
// };

// middleware/auth.js or similar
export const isAdminOrTraderOrDistrbutor = (req, res, next) => {
  const userRole = req.user.role;
  if (
    userRole === "admin" ||
    userRole === "trader" ||
    userRole === "distributor"
  ) {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Access denied. Admins or Traders only." });
  }
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // Log the header
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token); // Log the token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log the decoded token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// export const verifyToken = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Missing or invalid token" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id); // adjust based on your token structure
//     if (!user) throw new Error("User not found");

//     req.user = user;
//     next();
//     console.log("Token:", token);
//     console.log("JWT_SECRET:", process.env.JWT_SECRET);
//   } catch (err) {
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

//export default verifyToken;
