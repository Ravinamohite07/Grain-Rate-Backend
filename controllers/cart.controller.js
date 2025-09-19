// File: controllers/cart.controller.js

import Price from "../models/price.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

// ✅ FULLY CORRECTED AND ROBUST addToCart FUNCTION
export const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const priceData = await Price.findOne({ productId });
    if (!priceData || typeof priceData.price !== "number") {
      return res
        .status(404)
        .json({ message: "Price not found for this product." });
    }

    // --- FIX 1: Always work with the price per single unit ---
    const pricePerUnit = priceData.price;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new one.
      cart = new Cart({ userId, items: [], totalAmount: 0 });
    }

    // Check if the product already exists in the cart.
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // If item exists, just update its quantity.
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // --- FIX 2: Store the UNIT price, not the total price for the line item ---
      cart.items.push({ productId, quantity, price: pricePerUnit });
    }

    // --- FIX 3: Recalculate the entire cart total from scratch. This is the safest method. ---
    let newTotalAmount = 0;
    for (const item of cart.items) {
      // The item's price is the unit price.
      newTotalAmount += item.quantity * item.price;
    }
    cart.totalAmount = newTotalAmount;

    await cart.save();

    // --- FIX 4: Send back the totalAmount at the top level, as the frontend expects ---
    res.status(200).json({
      message: "Product added to cart successfully.",
      totalAmount: cart.totalAmount,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add to cart", error });
  }
};

// ✅ FULLY CORRECTED AND ROBUST removeFromCart FUNCTION
export const removeFromCart = async (req, res) => {
  // userId is still needed for authorization, can be from auth middleware or body
  const { userId } = req.body;
  // productId now comes from the URL parameters, which is standard
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item to be removed
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // --- FIX 5: Correctly recalculate the total after removal ---
    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const updatedCart = await cart.save();
    // Send back the whole updated cart so the frontend can refresh its state
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart", error });
  }
};

// This function gets the user's cart.
export const getCart = async (req, res) => {
  const { userId } = req.query;
  try {
    // Find the cart and populate product details for each item
    let cart = await Cart.findOne({ userId }).populate("items.productId");

    // If a user has no cart, it's not an error. Just return an empty cart structure.
    if (!cart) {
      return res.status(200).json({
        userId: userId,
        items: [],
        totalAmount: 0,
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart", error });
  }
};

// This function is for admin purposes to see all carts.
export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("items.productId");
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch carts", error });
  }
};

// This function clears all items from a user's cart.
export const clearCart = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the cart and update it to be empty, instead of deleting the document
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalAmount: 0 },
      { new: true } // returns the modified document
    );

    if (cart) {
      res.status(200).json({ message: "Cart cleared successfully" });
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart", error });
  }
};
/// new code 31/07/2025/////
// GET /api/cart/summary
export const getCartSummary = async (req, res) => {
  try {
    const userId = req.user._id; // safer than using req.params or req.body

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      // If cart doesn't exist, return zero values
      return res.status(200).json({
        cartCount: 0,
        totalQuantity: 0,
      });
    }

    const cartCount = cart.items.length; // Number of distinct products
    const totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    res.status(200).json({ cartCount, totalQuantity });
  } catch (error) {
    console.error("Error fetching cart summary:", error);
    res.status(500).json({ message: "Server error fetching cart summary" });
  }
};
// ======================= old code 10/07/2025 cart.controller.js =======================

// // Add product to cart
// import Price from "../models/price.model.js";
// import Product from "../models/product.model.js";
// import Cart from "../models/cart.model.js";

// export const addToCart = async (req, res) => {
//   const { userId, productId, quantity } = req.body;

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     const priceData = await Price.findOne({ productId });
//     if (!priceData) {
//       return res.status(404).json({ message: "Price not found for the given product." });
//     }

//     const pricePerUnit = priceData.price;
//     const totalPrice = pricePerUnit * quantity;

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({
//         userId,
//         items: [{ productId, quantity, price: totalPrice }],
//         totalAmount: totalPrice,
//       });
//     } else {
//       const existingProductIndex = cart.items.findIndex(
//         (item) => item.productId.toString() === productId
//       );

//       if (existingProductIndex > -1) {
//         cart.items[existingProductIndex].quantity += quantity;
//         cart.items[existingProductIndex].price += totalPrice;
//       } else {
//         cart.items.push({ productId, quantity, price: totalPrice });
//       }

//       cart.totalAmount += totalPrice;
//     }

//     const updatedCart = await cart.save();

//     res.status(201).json({ message: "Product added to cart successfully.", cart: updatedCart });
//   } catch (error) {
//     console.error("Error adding to cart:", error);
//     res.status(500).json({ message: "Failed to add to cart", error });
//   }
// };

// // Get user cart
// // export const getCart = async (req, res) => {
// //   const { userId } = req.query;

// //   try {
// //     const cart = await Cart.findOne({ userId }).populate("items.productId");

// //     if (!cart) {
// //       return res.status(404).json({ message: "Cart not found" });
// //     }

// //     res.json(cart);
// //   } catch (error) {
// //     res.status(500).json({ message: "Failed to fetch cart", error });
// //   }
// // };

// // Get user cart
// export const getCart = async (req, res) => {
//     const { userId } = req.query;

//     try {
//       // Try to find the cart
//       let cart = await Cart.findOne({ userId }).populate("items.productId");

//       // If cart doesn't exist, create a new cart
//       if (!cart) {
//         cart = new Cart({
//           userId,
//           items: [],
//           totalAmount: 0,
//         });
//         await cart.save(); // Save the new cart
//         return res.status(201).json(cart); // Return the new cart
//       }

//       res.json(cart);
//     } catch (error) {
//       res.status(500).json({ message: "Failed to fetch cart", error });
//     }
//   };

// // Get all carts (for admin purposes)
// export const getAllCarts = async (req, res) => {
//     try {
//       const carts = await Cart.find().populate("items.productId");
//       res.json(carts);
//     } catch (error) {
//       res.status(500).json({ message: "Failed to fetch carts", error });
//     }
//   };

// // Remove product from cart
// // export const removeFromCart = async (req, res) => {
// //   const { userId } = req.body;
// //   const { productId } = req.params;

// //   try {
// //     const cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       return res.status(404).json({ message: "Cart not found" });
// //     }

// //     cart.items = cart.items.filter(item => item.productId.toString() !== productId);
// //     cart.totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0);

// //     const updatedCart = await cart.save();
// //     res.json(updatedCart);
// //   } catch (error) {
// //     res.status(500).json({ message: "Failed to remove item from cart", error });
// //   }
// // };
// // Remove product from cart

// // export const removeFromCart = async (req, res) => {
// //     const { userId } = req.body; // Ensure userId is being sent
// //     const { productId } = req.params;

// //     console.log(`User ID: ${userId}, Product ID: ${productId}`); // Debug log

// //     try {
// //       const cart = await Cart.findOne({ userId });

// //       console.log(`Cart found: ${cart}`); // Debug log

// //       if (!cart) {
// //         return res.status(404).json({ message: "Cart not found" });
// //       }

// //       cart.items = cart.items.filter(item => item.productId.toString() !== productId);
// //       cart.totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0);

// //       const updatedCart = await cart.save();
// //       res.json(updatedCart);
// //     } catch (error) {
// //       res.status(500).json({ message: "Failed to remove item from cart", error });
// //     }
// //   };

// export const removeFromCart = async (req, res) => {
//   const { userId } = req.body; // Ensure userId is being sent
//   const { productId } = req.params;

//   try {
//       const cart = await Cart.findOne({ userId });
//       if (!cart) {
//           return res.status(404).json({ message: "Cart not found" });
//       }

//       cart.items = cart.items.filter(item => item.productId.toString() !== productId);
//       cart.totalAmount = cart.items.reduce((acc, item) => acc + item.price, 0);

//       const updatedCart = await cart.save();
//       res.json(updatedCart);
//   } catch (error) {
//       res.status(500).json({ message: "Failed to remove item from cart", error });
//   }
// };

// // Clear cart
// export const clearCart = async (req, res) => {
//   const { userId } = req.body;

//   try {
//     const cart = await Cart.findOneAndDelete({ userId });
//     if (cart) {
//       res.json({ message: "Cart cleared" });
//     } else {
//       res.status(404).json({ message: "Cart not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Failed to clear cart", error });
//   }
// };
