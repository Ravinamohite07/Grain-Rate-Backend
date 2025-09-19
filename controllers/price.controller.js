import Product from "../models/product.model.js";
import Price from "../models/price.model.js";
import path from "path";
import fs from "fs";
import xlsx from "xlsx";
import { fileURLToPath } from "url";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import multer from "multer";
import { PermissionRequest } from "../models/permission.model.js";
// export const addPrice = async (req, res) => {
//   const { productName, prices, userName, brandName, packagingSize, unitType, grainImage } = req.body;

//   if (
//     !productName ||
//     !prices ||
//     !Array.isArray(prices) ||
//     prices.length === 0 ||
//     !brandName ||
//     !packagingSize ||
//     !unitType
//   ) {
//     return res.status(400).json({ message: "All product details and prices are required." });
//   }

//   try {
//     // Create a new product or check if it already exists
//     let product = await Product.findOne({ productName, brandName });
//     if (!product) {
//       product = new Product({
//         productName,
//         userName,
//         brandName,
//         packagingSize,
//         unitType,
//         grainImage,
//         currentDate: new Date().toISOString(),
//       });
//       product = await product.save(); // Save the product
//     }

//     // Add prices linked to the productId
//     const priceEntries = prices.map((price) => ({
//       productId: product._id, // Reference productId
//       productName: product.productName,
//       prices: [
//         {
//           price: price.price,
//           region: price.region,
//           userType: price.userType,
//         },
//       ],
//     }));

//     await Price.insertMany(priceEntries);

//     res.status(201).json({ message: "Product and prices added successfully." });
//   } catch (error) {
//     console.error("Error adding prices:", error);
//     res.status(500).json({ message: "Failed to add prices", error: error.message });
//   }
// };

// import User from './models/User';  // Ensure you're importing the User model
// import Product from './models/Product';  // Ensure you're importing the Product model
// import Price from './models/Price';  // Ensure you're importing the Price model

const MAX_PRICE_ADDITIONS = 5;

export const addPrice = async (req, res) => {
  try {
    console.log("Incoming req.body:", req.body);

    const {
      productName,
      brandName,
      packagingSize,
      unitType,
      prices,
      createdFor,
    } = req.body;
    const currentLoggedInUserId = req.user._id;
    const currentUserRole = req.user.role;

    console.log("Logged-in User ID:", currentLoggedInUserId);
    console.log("Logged-in User Role:", currentUserRole);
    console.log("Target Role:", createdFor.role);

    // Check if the user is not an admin and enforce the limit
    if (currentUserRole !== "admin") {
      const recentProductCount = await Product.countDocuments({
        createdBy: currentLoggedInUserId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      const permission = await PermissionRequest.findOne({
        userId: currentLoggedInUserId,
        status: "approved",
      });

      if (recentProductCount >= MAX_PRICE_ADDITIONS && !permission) {
        return res.status(403).json({
          message: `As a ${currentUserRole}, you have reached the limit of ${MAX_PRICE_ADDITIONS} price additions within the last 24 hours. Please contact the admin to add more.`,
        });
      }
    }

    // Create a new product first
    const newProduct = new Product({
      productName,
      brandName,
      packagingSize,
      unitType,
      createdBy: currentLoggedInUserId, // ID of the user who added the product
      productCreatorRole: currentUserRole, // Role of the user who added the product
      createdFor: createdFor.role,
      //createdFor: createdFor, // ✅ fixed here
      grainImage: "placeholder_url",
    });
    const savedProduct = await newProduct.save();
    console.log("New Product Created:", savedProduct);

    const newPriceIds = [];

    // Find users with the target role ('createdFor.role') whose 'createdBy' field
    // matches the _id of the currently logged-in user.
    const users = await User.find({
      role: createdFor.role,
      createdBy: currentLoggedInUserId, // Use the ObjectId of the logged-in user
      status: "accepted",
    });

    console.log(
      "Found Users:",
      users.map((user) => ({
        id: user._id,
        createdBy: user.createdBy,
        role: user.role,
      }))
    );

    if (!users || users.length === 0) {
      return res.status(400).json({
        message: `No users found with role ${createdFor.role} under your management.`,
      });
    }

    for (const user of users) {
      console.log("Processing User:", {
        id: user._id,
        createdBy: user.createdBy,
        role: user.role,
      });
      if (!user || !user._id || !user.state || !user.district || !user.taluka) {
        console.error("Invalid user object:", user);
        continue;
      }
      for (const priceData of prices) {
        const existingPrice = await Price.findOne({
          productId: savedProduct._id,
          "region.state": priceData.region.state,
          "region.district": priceData.region.district,
          "region.taluka": priceData.region.taluka,
          role: priceData.role,
        });

        if (existingPrice) {
          console.log(
            `Price for ${priceData.role} in ${priceData.region.state}, ${priceData.region.district} already exists for user ID: ${user._id}`
          );
          continue;
        }

        const newPrice = new Price({
          productId: savedProduct._id,
          price: priceData.price,
          role: priceData.role,
          createdBy: currentLoggedInUserId,
          region: {
            state: priceData.region.state,
            district: priceData.region.district,
            taluka: priceData.region.taluka,
          },
        });

        const savedPrice = await newPrice.save();
        newPriceIds.push(savedPrice._id);
        console.log(
          "Price added for user ID:",
          user._id,
          "Price ID:",
          savedPrice._id
        );
      }
    }

    if (newPriceIds.length > 0) {
      await Product.findByIdAndUpdate(savedProduct._id, {
        $push: { prices: { $each: newPriceIds } },
      });
    }

    return res.status(201).json({
      message: "Product and prices added successfully for the managed users.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

export default Product;

export const fetchPricesByUserType = async (req, res) => {
  const { userType } = req.query;

  if (!userType) {
    return res.status(400).json({ message: "User type is required." });
  }

  try {
    // ✅ Fetch only approved prices
    const approvedPrices = await Price.find({
      status: "approved",
      userType,
    }).populate(
      "productId",
      "productName brandName packagingSize unitType grainImage"
    );

    res.status(200).json({ data: approvedPrices });
  } catch (error) {
    console.error("Error fetching prices:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch prices", error: error.message });
  }
};

const formatDate = (date) => {
  return date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "N/A"; // Return "N/A" if no date is provided
};

export const fetchPendingPrices = async (req, res) => {
  try {
    console.log("🔍 Fetching pending prices for user:", req.user);

    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "super-user")
    ) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    // Fetch only pending prices
    const pendingPrices = await Price.find({ status: "pending" }).populate(
      "productId",
      "productName brandName packagingSize unitType grainImage"
    );

    console.log("✅ Pending Prices Fetched:", pendingPrices);

    res.status(200).json({ data: pendingPrices });
  } catch (error) {
    console.error("❌ Error fetching pending prices:", error);
    res.status(500).json({
      message: "Failed to fetch pending prices",
      error: error.message,
    });
  }
};
// or wherever your model is

// export const getProductsByUserType = async (req, res) => {
//   // Ensure the user is authenticated
//   if (!req.user) {
//     return res.status(401).json({ message: "Unauthorized: User not authenticated" });
//   }

//   console.log("Current user:", req.user);

//   try {
//     const { userType } = req.query;

//     if (!userType) {
//       return res.status(400).json({ message: "userType is required" });
//     }

//     // Ensure the user has a createdBy field
//     const parentUserId = req.user.createdBy;
//     if (!parentUserId) {
//       return res.status(400).json({ message: "User's parent ID is missing" });
//     }

//     const allowedOwnerIds = [null, parentUserId]; // Admin products or direct parent's

//     // Fetch all price records for the given userType
//     const priceData = await Price.find({
//       "prices.userType": userType,
//     }).populate(
//       "productId",
//       "productName brandName packagingSize unitType grainImage ownerId"
//     );

//     if (!priceData || priceData.length === 0) {
//       return res
//         .status(404)
//         .json({ message: `No products found for user type: ${userType}` });
//     }

//     // Filter by allowed ownerIds
//     const filteredPriceData = priceData.filter((price) => {
//       const product = price.productId;
//       return (
//         product && allowedOwnerIds.includes(product.ownerId?.toString() || null)
//       );
//     });

//     const products = filteredPriceData
//       .map((price) => {
//         const { productId, prices } = price;

//         if (!productId) return null;

//         const productPrices = prices.filter((p) => p.userType === userType);

//         return productPrices.length
//           ? {
//               ...productId.toObject(),
//               price: productPrices[0].price,
//               lastUpdated: productPrices[0].currentDate,
//             }
//           : null;
//       })
//       .filter((product) => product !== null);

//     res.status(200).json({ data: products });
//   } catch (error) {
//     console.error("Error fetching products by user type:", error);
//     res.status(500).json({
//       message: "An error occurred while fetching products by user type",
//       error: error.message,
//     });
//   }
// };

// In your product.controller.js (or wherever you handle product-related logic)
// Import Product model

// In your product.controller.js (or wherever you handle product logic)

// export const getProductsByRegionAndUserType = async (req, res) => {
//   try {
//     const { userType, state, district, taluka } = req.query;
//     const filters = {};

//     if (userType) {
//       filters['createdFor'] = userType;
//     }

//     const regionFilter = {};
//     if (state) {
//       regionFilter['region.state'] = state;
//     }
//     if (district) {
//       regionFilter['region.district'] = district;
//     }
//     if (taluka) {
//       regionFilter['region.taluka'] = taluka;
//     }

//     console.log("Backend Filters:", filters);
//     console.log("Backend Region Filter:", regionFilter);

//     const products = await Product.find(filters).populate({
//       path: 'prices',
//       match: regionFilter,
//     });

//     console.log("Backend Found Products (before final filter):", products);

//     const filteredProducts = products.filter(product => product.prices.length > 0);

//     console.log("Backend Filtered Products (final):", filteredProducts);

//     res.status(200).json({
//       success: true,
//       count: filteredProducts.length,
//       data: filteredProducts,
//     });
//   } catch (error) {
//     console.error('Error fetching products by region and user type:', error);
//     res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
//   }
// };

//const MAX_PRICE_ADDITIONS = 50; // Define your limit here

export const uploadPrices = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const currentLoggedInUserId = req.user._id;
    const currentUserRole = req.user.role;

    if (!currentLoggedInUserId || !currentUserRole) {
         return res.status(401).json({ message: "Authentication required for price upload." });
    }

    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Map to store new Price IDs for each Product, keyed by productId
    const productPriceUpdates = new Map(); // Key: productId, Value: Set of Price _ids

    for (const row of data) {
      const {
        "Product Name": productName,
        "Brand Name": brandName,
        "Packaging Size": packagingSize,
        Unit: unitType,
        State,
        District,
        Taluka,
        "User Type": userType,
        Price: price,
      } = row;

      if (!productName || !State || !District || !Taluka || !userType || !price) {
        console.error("Skipping invalid row due to missing Excel data:", row);
        continue;
      }

      const lowercasedUserType = userType.toLowerCase();

      //let product = await Product.findOne({ productName });
       let product = await Product.findOne({
          productName,
          brandName: brandName || null,
          packagingSize: packagingSize || null,
          unitType: unitType || null,
       });

      if (!product) {
        product = await Product.create({
          productName,
          brandName: brandName || null,
          packagingSize: packagingSize || null,
          unitType: unitType || null,
          grainImage: "https://example.com/placeholder-grain.jpg",
          createdBy: currentLoggedInUserId,
          productCreatorRole: currentUserRole,
          createdFor: lowercasedUserType,
        });
      }

      const productId = product._id;

      // Initialize the Set for this product if it doesn't exist
      if (!productPriceUpdates.has(productId.toString())) {
          productPriceUpdates.set(productId.toString(), new Set());
      }


      const priceDocumentFilter = {
        productId: productId,
        "region.state": State,
        "region.district": District,
        "region.taluka": Taluka,
        role: lowercasedUserType,
      };

      let existingPriceDocument = await Price.findOne(priceDocumentFilter);

      const newPriceHistoryEntry = {
        price: price,
        region: { state: State, district: District, taluka: Taluka },
        userType: lowercasedUserType,
        addedDate: new Date(),
      };

      if (existingPriceDocument) {
        await Price.updateOne(
          { _id: existingPriceDocument._id },
          {
            $set: {
              price: price,
            },
            $push: { prices: newPriceHistoryEntry },
          }
        );
         // Add the ID of the existing price document to the set for this product
        productPriceUpdates.get(productId.toString()).add(existingPriceDocument._id);

      } else {
        const newPriceDoc = await Price.create({
          productId: productId,
          productName: productName,
          price: price,
          //role: lowercasedUserType,
          role: req.user.role,
          createdBy: currentLoggedInUserId,
          region: {
            state: State,
            district: District,
            taluka: Taluka,
          },
          prices: [newPriceHistoryEntry],
          createdAt: new Date(), // Add if your schema has it
          updatedAt: new Date(), // Add if your schema has it
        });
        // Add the ID of the newly created price document to the set for this product
        productPriceUpdates.get(productId.toString()).add(newPriceDoc._id);
      }
    } // End of for...of loop

    // --- After processing all rows, update Product documents with their associated Price IDs ---
    for (const [prodId, priceIds] of productPriceUpdates.entries()) {
        const priceIdsArray = Array.from(priceIds);
        if (priceIdsArray.length > 0) {
            await Product.findByIdAndUpdate(prodId, {
                $addToSet: { prices: { $each: priceIdsArray } } // Use $addToSet to avoid duplicates if Price IDs might overlap
            });
        }
    }

    res.status(200).json({ message: "Prices uploaded successfully and products updated." });
  } catch (error) {
    console.error("❌ Error uploading prices:", error);
    res
      .status(500)
      .json({ message: "Failed to upload prices", error: error.message });
  }
};

// Make sure you have your Mongoose models imported
// const Product = require('../models/Product');
// const Price = require('../models/Price');

// DELETE YOUR OLD FUNCTION AND PASTE THIS ENTIRE NEW ONE

// FINAL VERSION - WORKS WITHOUT AUTHENTICATION

export const approvePrice = async (req, res) => {
  const { priceId } = req.params;

  try {
    const price = await Price.findById(priceId);

    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }

    // Only allow admin to approve prices
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to approve prices." });
    }

    // Check if the price is in pending status before approval
    if (price.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Price is not in pending status." });
    }

    // Mark the price as approved
    price.status = "approved";
    await price.save();

    res
      .status(200)
      .json({ message: "Price approved successfully", data: price });
  } catch (error) {
    console.error("❌ Error approving price:", error);
    res
      .status(500)
      .json({ message: "Failed to approve price", error: error.message });
  }
};

export const rejectPrice = async (req, res) => {
  const { priceId } = req.params;

  try {
    const price = await Price.findById(priceId);

    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }

    // Only allow admin to reject prices
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You do not have permission to reject prices." });
    }

    // Check if the price is in pending status before rejection
    if (price.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Price is not in pending status." });
    }

    // Mark the price as rejected
    price.status = "rejected";
    await price.save();

    res
      .status(200)
      .json({ message: "Price rejected successfully", data: price });
  } catch (error) {
    console.error("❌ Error rejecting price:", error);
    res
      .status(500)
      .json({ message: "Failed to reject price", error: error.message });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads"); // Adjust path as needed

export const downloadPriceTemplate = (req, res) => {
  try {
    const fileName = "PriceTemplate.xlsx";
    const filePath = path.join(uploadsDir, fileName);

    // Create Excel file if it doesn’t exist
    if (!fs.existsSync(filePath)) {
      const worksheetData = [
        [
          "Product Name",
          "Brand Name",
          "Packaging Size",
          "Unit",
          "State",
          "District",
          "Taluka/City", // Updated column name for clarity
          "User Type",
          "Price",
        ],
        // You can add an example row here if you want
        // ['Basmati Rice', 'India Gate', '1', 'kg', 'Karnataka', 'Bengaluru Urban', 'Bangalore East', 'retailer', '60'],
      ];
      const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
      xlsx.writeFile(workbook, filePath);
    }

    // Send file as a response
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res
          .status(500)
          .json({ message: "Failed to download file", error: err.message });
      }
    });
  } catch (error) {
    console.error("Error generating template:", error);
    res
      .status(500)
      .json({ message: "Error generating Excel file", error: error.message });
  }
};
