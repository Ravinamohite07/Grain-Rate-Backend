///---------------------03/07/2025 --------------------------

// controllers/productController.js
import Product from "../models/product.model.js";

import Price from "../models/price.model.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Get all products
// export const getProducts = async (req, res) => {
//   try {
//     // Use aggregation to join the Product and Price collections
//     const products = await Product.aggregate([
//       {
//         $lookup: {
//           from: "prices", // The name of the Price collection (lowercase by default in Mongoose)
//           localField: "_id", // Field from the Product collection
//           foreignField: "productId", // Field from the Price collection
//           as: "prices", // The name of the array in the result
//         },
//       },
//     ]);

//     res.json(products);
//   } catch (error) {
//     console.error("Failed to fetch products:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch products", error: error.message });
//   }
// };

// controllers/productController.js
// import Product from "../models/product.model.js";
// import Price from "../models/price.model.js";
// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js";

// Get all products added by the logged-in admin
export const getProducts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // Assuming you have authentication middleware that adds user info to the request

    // Use aggregation to join the Product and Price collections and filter by createdBy
    const products = await Product.aggregate([
      {
        $match: {
          createdBy: loggedInUserId, // Filter products by the logged-in admin's ID
        },
      },
      {
        $lookup: {
          from: "prices", // The name of the Price collection
          localField: "_id", // Field from the Product collection
          foreignField: "productId", // Field from the Price collection
          as: "prices", // The name of the array in the result
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Get a single product by ID
// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch product", error });
//   }
// };

// export const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate("prices");

//     if (product) {
//       res.json(product);
//     } else {
//       res.status(404).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch product", error });
//   }
// };

// Get a single product by ID, ensuring prices are populated
export const getProductById = async (req, res) => {
  try {
    // Step 1: Find the product and populate its associated prices
    const product = await Product.findById(req.params.id).populate("prices");

    if (product) {
      // Step 2: Find the latest price from the populated array
      const latestPrice =
        product.prices.length > 0
          ? product.prices[product.prices.length - 1].price
          : null;

      // Step 3: Create a clean response object with a simple 'price' field for the form
      const productData = {
        ...product.toObject(), // Include all original product fields
        price: latestPrice, // Add the 'price' field that the frontend needs
      };

      res.json(productData);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};

// // Create a new product
// export const createProduct = async (req, res) => {
//   const {
//     productName,
//     userName,
//     price,
//     brandName,
//     packagingSize,
//     unitType,
//     grainImage,
//   } = req.body;
//   const addedByUser = req.user; // The logged-in user

//   // Ensure that the user is authenticated and has a valid user ID
//   if (!addedByUser || !addedByUser._id) {
//     return res
//       .status(400)
//       .json({ message: "User not authenticated or missing ID." });
//   }

//   try {
//     const product = new Product({
//       productName,
//       userName,
//       price,
//       brandName,
//       packagingSize,
//       unitType,
//       currentDate: new Date().toISOString(), // Ensure the current date is in ISO format
//       grainImage,
//       ownerId: addedByUser._id, // Set owner to the logged-in user
//     });
//     const createdProduct = await product.save();
//     res.status(201).json(createdProduct);
//   } catch (error) {
//     res.status(400).json({ message: "Failed to create product", error });
//   }
// };
export const createProduct = async (req, res) => {
  const {
    productName,
    brandName,
    packagingSize,
    unitType,
    grainImage,
    price,
    region,
    createdFor,
  } = req.body;

  const user = req.user;

  if (!user || !user._id) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  try {
    // Step 1: Create Product
    const product = new Product({
      productName,
      brandName,
      packagingSize,
      unitType,
      grainImage,
      createdBy: user._id,
      createdFor,
    });

    const savedProduct = await product.save();

    // Step 2: Create Price
    const newPrice = new Price({
      price,
      role: user.role,
      productId: savedProduct._id,
      createdBy: user._id,
      region,
    });

    const savedPrice = await newPrice.save();

    // Step 3: Update product to link price
    savedProduct.prices.push(savedPrice._id);
    await savedProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", product: savedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};
// /controllers/productController.js
export const getMyProducts = async (req, res) => {
  const user = req.user;

  try {
    // Make sure user._id is available
    if (!user._id) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    let query = {};

    // Admin can see all products created by them
    if (user.role === "admin") {
      query.createdBy = user._id;
    }
    // Other roles can only see products specifically created for them AND by their manager
    else if (
      ["trader", "distributor", "retailer", "farmer"].includes(user.role)
    ) {
      // Fetch the creator's ID of the logged-in user
      const loggedInUser = await User.findById(user._id);
      if (!loggedInUser || !loggedInUser.createdBy) {
        return res
          .status(400)
          .json({ message: "Could not find the creator for this user." });
      }
      query = { createdFor: user.role, createdBy: loggedInUser.createdBy };
    } else {
      return res
        .status(403)
        .json({ message: "Unauthorized to view products." });
    }

    const products = await Product.find(query).populate("prices");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for you." });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
};

//-------------------------------------- old code for reference ----------------------------
// // Update an existing product
// export const updateProduct = async (req, res) => {
//   const {
//     productName,
//     userName,
//     price,
//     brandName,
//     packagingSize,
//     unitType,
//     //grainImage,
//   } = req.body;
//   try {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       product.productName = productName || product.productName;
//       product.userName = userName || product.userName;
//       product.price = price || product.price;
//       product.brandName = brandName || product.brandName;
//       product.packagingSize = packagingSize || product.packagingSize;
//       product.unitType = unitType || product.unitType;
//       // product.grainImage = grainImage || product.grainImage;

//       const updatedProduct = await product.save();
//       res.json(updatedProduct);
//     } else {
//       res.status(404).json({ message: "Product not found" });
//     }
//   } catch (error) {
//     res.status(400).json({ message: "Failed to update product", error });
//   }
// };
///--------------------------------------------------------------
// export const updateProduct = async (req, res) => {
//   const productId = req.params.id;
//   const {
//     productName,
//     brandName,
//     packagingSize,
//     unitType,
//     price,
//     createdFor, //Accept this in the request
//   } = req.body;

//   try {
//     const product = await Product.findById(productId).populate("prices");

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Step 1: Update product fields
//     if (productName) product.productName = productName;
//     if (brandName) product.brandName = brandName;
//     if (packagingSize) product.packagingSize = packagingSize;
//     if (unitType) product.unitType = unitType;
//     if (createdFor) product.createdFor = createdFor; // Update createdFor here

//     await product.save();

//     // Step 2: Update price if present
//     if (price) {
//       const priceRecord = product.prices[0];
//       if (priceRecord) {
//         priceRecord.price = price;
//         await priceRecord.save();
//       }
//     }

//     res.status(200).json({ message: "Product updated successfully", product });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating product", error });
//   }
// };
/////////////////////////////////////////////////////////////////////
export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { productName, brandName, packagingSize, unitType, price, createdFor } =
    req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.productName = productName || product.productName;
    product.brandName = brandName || product.brandName;
    product.packagingSize = packagingSize || product.packagingSize;
    product.unitType = unitType || product.unitType;
    product.createdFor = createdFor || product.createdFor;
    await product.save();

    if (price) {
      const latestPrice = await Price.findOne({ productId: product._id }).sort({
        createdAt: -1,
      });
      if (latestPrice) {
        latestPrice.price = Number(price);
        await latestPrice.save();
      } else {
        const newPrice = new Price({
          price: Number(price),
          productId: product._id,
          role: product.createdFor,
        });
        await newPrice.save();
      }
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: req.params.id }); // Use deleteOne instead of remove
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error during product deletion:", error); // Log detailed error
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

// export const getProductsByUserType = async (req, res) => {
//   try {
//     const { userType } = req.query;

//     if (!userType) {
//       return res.status(400).json({ message: "userType is required" });
//     }

//     console.log("Fetching products for user type:", userType);

//     // Fetch price data based on userType
//     const priceData = await Price.find({ "prices.userType": userType })
//       .populate("productId", "productName brandName packagingSize unitType grainImage");

//     console.log("Fetched price data:", priceData);

//     if (!priceData || priceData.length === 0) {
//       return res.status(404).json({ message: `No products found for user type: ${userType}` });
//     }

//     // Extract product details from populated data
//     const products = priceData.map(price => {
//       const { productId, prices } = price;
//       const productPrices = prices.filter(p => p.userType === userType);
//       return {
//         ...productId.toObject(),
//         price: productPrices.length ? productPrices[0].price : null, // Attach price based on userType
//       };
//     });

//     res.status(200).json({ data: products });
//   } catch (error) {
//     console.error("Error fetching products by user type:", error);
//     res.status(500).json({ message: "An error occurred while fetching products by user type", error: error.message });
//   }
// };

export const getFilteredProducts = async (req, res) => {
  try {
    const { state, district, taluka, userType } = req.query;

    if (!state || !district || !taluka || !userType) {
      return res.status(400).json({
        message:
          "state, district, taluka, and userType are required query parameters.",
      });
    }

    // Step 1: Find all matching Price entries
    const matchingPrices = await Price.find({
      "region.state": state,
      "region.district": district,
      "region.taluka": taluka,
      role: userType,
    }).select("productId"); // Only need the productId

    const productIds = [
      ...new Set(matchingPrices.map((p) => p.productId.toString())),
    ]; // Unique product IDs

    // Step 2: Find products with these IDs
    const products = await Product.find({ _id: { $in: productIds } }).populate({
      path: "prices",
      match: {
        "region.state": state,
        "region.district": district,
        "region.taluka": taluka,
        role: userType,
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};

export const getRegionSpecificProducts = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id || !user.role) {
      return res.status(400).json({ message: "Invalid user." });
    }

    if (!user.state || !user.district || !user.taluka) {
      return res.status(400).json({ message: "User region missing." });
    }

    // Get the creator (admin) of this user
    const userDoc = await User.findById(user._id).select("createdBy");
    if (!userDoc?.createdBy) {
      return res
        .status(400)
        .json({ message: "No creator found for this user." });
    }

    const adminId = userDoc.createdBy;

    // Find prices matching the user's region and created by the admin
    const matchingPrices = await Price.find({
      createdBy: adminId,
      "region.state": user.state,
      "region.district": user.district,
      "region.taluka": user.taluka,
    });

    if (!matchingPrices.length) {
      return res
        .status(404)
        .json({ message: "No prices found for your region." });
    }

    const productIds = [
      ...new Set(matchingPrices.map((p) => p.productId.toString())),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
      createdFor: user.role,
    }).populate({
      path: "prices",
      match: {
        createdBy: adminId,
        "region.state": user.state,
        "region.district": user.district,
        "region.taluka": user.taluka,
      },
    });

    return res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching region products:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
