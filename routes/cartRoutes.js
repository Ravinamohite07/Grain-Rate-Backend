// File: routes/cart.routes.js
import { protect } from "../middleware/authorization.js";
import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  getCartSummary,
} from "../controllers/cart.controller.js";

const router = express.Router();

// GET cart for a user & POST a new item to the cart
router.route("/").get(getCart).post(addToCart);

// DELETE the entire cart for a user
router.route("/clear").delete(clearCart);

// DELETE a specific item from the cart
// This is more specific and standard: /api/cart/items/PRODUCT_ID
router.route("/items/:productId").delete(removeFromCart);
router.get("/summary", protect, getCartSummary);

export default router;

// ================ old code 10/07/2025 Cart Routes ================

// import express from "express";
// import {
//   addToCart,
//   getCart,
//   removeFromCart,
//   clearCart,
// } from "../controllers/cart.controller.js";

// const router = express.Router();

// router.route("/").post(addToCart).get(getCart).delete(clearCart);
// router.route("/:productId").delete(removeFromCart);

// export default router;
