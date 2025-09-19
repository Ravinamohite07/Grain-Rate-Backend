// //this is for the main server embel
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";

// import { connectionDB } from "./config/db.js";

// import productRoutes from "./routes/productRoutes.js";
// import cartRoutes from "./routes/cartRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";
// import priceRoutes from "./routes/priceRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";
// import ProcessImageRoutes from "./routes/ProcessImageRoutes.js";
// import { createProxyMiddleware } from "http-proxy-middleware"; // Still imported but will be removed below
// import permissionRoutes from "./routes/permissionRoutes.js";

// // Remove broken WhatsApp imports for now
// // import { initWhatsAppClients, setupWhatsAppSocket } from "./utils/whatsappService.js";

// import { initSocket } from "./socket.js";

// const app = express();
// // **************************** CHANGE 1: Node.js Port ****************************
// // Ensure this matches your Node.js backend's actual listening port (2872).
// // Option A: Ensure process.env.PORT is set to 2872 in your environment.
// const PORT = process.env.PORT || 2872; // Changed default to 2872
// // Option B (less flexible): const PORT = 2872;
// // ********************************************************************************

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // Added this in previous suggestion, good to keep

// // Logger
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("🌾 GrainRate API is running!");
// });

// // Routes
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/prices", priceRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/messages", messageRoutes);

// // **************************** CHANGE 2: Correctly mount ProcessImageRoutes ****************************
// // This tells Express that any route starting with /api should be handled by the ProcessImageRoutes router.
// // The actual route within ProcessImageRoutes will be appended to /api.
// app.use("/api", ProcessImageRoutes);
// // *******************************************************************************************************

// app.use("/api/permission", permissionRoutes);

// // **************************** CHANGE 3: Remove Conflicting Proxy Middleware ****************************
// // This proxy is likely causing conflicts with your intended flow (React Native -> Node.js -> Flask).
// // Your Node.js ProcessImageRoutes.js already handles calling Flask.
// /*
// app.use(
//   "/process_image",
//   createProxyMiddleware({
//     target: "http://localhost:3000",
//     changeOrigin: true,
//   })
// );
// */
// // *******************************************************************************************************

// // 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack || err.message);
//   res
//     .status(500)
//     .json({ message: "Internal Server Error", error: err.message });
// });

// // Start server
// connectionDB()
//   .then(() => {
//     console.log("✅ Database Connected");

//     const server = app.listen(PORT, () =>
//       console.log(`🚀 Server started at http://localhost:${PORT}/`)
//     );

//     // Initialize socket.io
//     initSocket(server);

//     // WhatsApp client setup removed — add here later if needed
//     // initWhatsAppClients();
//     // setupWhatsAppSocket();
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1);
//   });

//++++++++++++++++++++++++++++++++++++++++++++++++++++
//this is for local:2872 server

// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";

// import { connectionDB } from "./config/db.js";

// import productRoutes from "./routes/productRoutes.js";
// import cartRoutes from "./routes/cartRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";
// import priceRoutes from "./routes/priceRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";
// import ProcessImageRoutes from "./routes/ProcessImageRoutes.js";
// import { createProxyMiddleware } from "http-proxy-middleware";
// import permissionRoutes from "./routes/permissionRoutes.js";
// import locationRoutes from "./routes/locationRoutes.js"; 
 
// // Remove broken WhatsApp imports for now
// // import { initWhatsAppClients, setupWhatsAppSocket } from "./utils/whatsappService.js";

// import { initSocket } from "./socket.js";

// const app = express();
// const PORT = process.env.PORT || 2872;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); //////////new add
// // Logger
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next();
// });

// app.get("/", (req, res) => {
//   res.send("🌾 GrainRate API is running!");
// });

// // Routes
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/prices", priceRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/process_image", ProcessImageRoutes);
// //app.use("/api", ProcessImageRoutes); //////// new add
// app.use("/api/permission", permissionRoutes);
// app.use("/api/locations", locationRoutes)/////new addded

// // Proxy to ML image processor
// app.use(
//   "/process_image",
//   createProxyMiddleware({
//     target: "http://localhost:5000",
//     changeOrigin: true,
//   })
// );
// /*
// app.use(
//   "/process_image",
//   createProxyMiddleware({
//     target: "http://localhost:5000",
//     changeOrigin: true,
//   })
// );*/ //this will also comment for now on server

// // 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ message: "Route not found" });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack || err.message);
//   res
//     .status(500)
//     .json({ message: "Internal Server Error", error: err.message });
// });

// // Start server
// connectionDB()
//   .then(() => {
//     console.log("✅ Database Connected");

//     const server = app.listen(PORT, () =>
//       console.log(`🚀 Server started at http://localhost:${PORT}/`)
//     );

//     // Initialize socket.io
//     initSocket(server);

//     // WhatsApp client setup removed — add here later if needed
//     // initWhatsAppClients();
//     // setupWhatsAppSocket();
//   })
//   .catch((err) => {
//     console.error("❌ Database connection failed:", err.message);
//     process.exit(1);
//   });
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// --- ADDED FOR AVATAR SYSTEM (Step 1: Imports) ---
import path from 'path';
import { fileURLToPath } from 'url';
// --- END OF ADDED CODE ---

import { connectionDB } from "./config/db.js";

// Your existing route imports
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import ProcessImageRoutes from "./routes/ProcessImageRoutes.js";
import permissionRoutes from "./routes/permissionRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

// --- ADDED FOR AVATAR SYSTEM (Step 2: Import new avatar routes) ---
import logoRoutes from './routes/logoRoutes.js';
// --- END OF ADDED CODE ---

import { createProxyMiddleware } from "http-proxy-middleware";
import { initSocket } from "./socket.js";

const app = express();
const PORT = process.env.PORT || 2872;

// --- ADDED FOR AVATAR SYSTEM (Step 3: ES Module __dirname setup) ---
// This is required for express.static to work correctly with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END OF ADDED CODE ---

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ADDED FOR AVATAR SYSTEM (Step 4: Serve the static avatar images) ---
// This makes the 'public/avatars' folder publicly accessible via the /avatars URL path.
// It should be placed with other top-level middleware.
app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// --- END OF ADDED CODE ---

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.send("🌾 GrainRate API is running!");
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/process_image", ProcessImageRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/locations", locationRoutes);

// --- ADDED FOR AVATAR SYSTEM (Step 5: Use the new avatar API routes) ---
// Place this with your other API routes for organization.
//app.use('/api/avatars', logoRoutes);
// --- END OF ADDED CODE ---

// Proxy to ML image processor
app.use(
  "/process_image",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
  })
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

// Start server
connectionDB()
  .then(() => {
    console.log("✅ Database Connected");

    const server = app.listen(PORT, () =>
      console.log(`🚀 Server started at http://localhost:${PORT}/`)
    );

    // Initialize socket.io
    initSocket(server);
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });