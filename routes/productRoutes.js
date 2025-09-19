// import express from "express";
// import {
//   getProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getFilteredProducts,
//   getMyProducts,
// } from "../controllers/product.controller.js";
// import { protect } from "../middleware/authorization.js";

// const router = express.Router();

// // This is the route your app is calling. It is correctly set up.
// router.get("/myproducts", protect, getMyProducts);

// // Other routes
// router.route("/").get(protect, getProducts).post(protect, createProduct);
// router.route("/:id").put(protect, updateProduct).delete(protect, deleteProduct);
// router.get("/filtered", getFilteredProducts);

// export default router;

//--------------------------------------------------------------

// // routes/productRoutes.js
// import express from "express";
// import {
//   getProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   //getProductsByUserType,
//   getFilteredProducts,
//   getMyProducts,
// } from "../controllers/product.controller.js";
// import { protect } from "../middleware/authorization.js";
// //import {getProductsByUserType} from "../controllers/price.controller.js";
// //import { getProductsByUserType } from "../controllers/product.controller.js";

// const router = express.Router();

// //router.get("/by-usertype", getProductsByUserType);
// router.get("/myproducts", protect, getMyProducts);

// router.route("/").get(protect, getProducts).post(createProduct);
// router
//   .route("/:id")
//   .get(getProductById)
//   .put(updateProduct)
//   .delete(deleteProduct);
// router.get("/filtered", getFilteredProducts); // New route

// //router.route("/usertype").get(getProductsByUserType);

// export default router;
///////////////////////////////////////////////////////////
// routes/product.routes.js
import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFilteredProducts,
  getMyProducts,
  getRegionSpecificProducts,
} from "../controllers/product.controller.js";
import { protect } from "../middleware/authorization.js";

const router = express.Router();

// --- CORRECTED ROUTE ORDER ---

// These routes are fine at the top as they are specific.
router.get("/myproducts", protect, getMyProducts);
router.get("/products-by-region", protect, getRegionSpecificProducts); //new route
// FIX: Define the MORE SPECIFIC '/filtered' route BEFORE the dynamic '/:id' route.
router.get("/filtered", getFilteredProducts);

router.route("/").get(protect, getProducts).post(protect, createProduct); // Added 'protect' to createProduct for consistency

// Now, define the dynamic route that catches product IDs.
// Any request that isn't for '/filtered' (like '/67a46...') will be handled here.
router
  .route("/:id")
  .get(protect, getProductById) // This will now correctly receive only valid IDs
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
