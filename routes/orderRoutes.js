import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { cancelOrder } from "../controllers/order.controller.js";
import { getUserOrders } from "../controllers/order.controller.js";
import {
  getAllOrders,
  getAllOrdersByUserType,
  getOrderCount,
  getAllOrdersByBrandAndProduct,
  getProductBrandOrderStatsWithPercentage 
} from "../controllers/order.controller.js";
import { acceptOrder, rejectOrder } from "../controllers/order.controller.js";
//import { superUserAcceptOrder } from "../controllers/order.controller.js";
import { getOrdersForSuperUser } from "../controllers/order.controller.js";
import { updateOrderStatusBySuperUser } from "../controllers/order.controller.js";
import { protect } from "../middleware/authorization.js";
const router = express.Router();

// ✅ ADD THIS TEST ROUTE AT THE VERY TOP
router.get("/test-route", (req, res) => {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("SUCCESS: /api/orders/test-route was reached!");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  res.status(200).send("Order router is working!");
});

// Route to create an order
router.post("/create-order",createOrder);

//router.delete("/cancel-order/:orderId", cancelOrder);
router.post("/cancel-order", cancelOrder);

router.get("/myorders/:userId", getUserOrders);

router.get("/all-orders", getAllOrders);

router.get("/byusertype", getAllOrdersByUserType);

// Accept Order
router.patch("/accept/:orderId", acceptOrder);

// Reject Order
router.patch("/reject/:orderId", rejectOrder);

// // Super User accepts the order and changes status to 'dispatched'
// router.patch('/superuser-accept/:orderId', superUserAcceptOrder);

// // Fetch orders accepted by the Admin (Super User View)
// router.get("/superuser", getOrdersForSuperUser);
// Superuser fetches orders accepted by admin
router.get("/superuser/orders", getOrdersForSuperUser);
// get Order Count
router.get("/count", protect, getOrderCount);

// Superuser updates order status
router.put("/superuser/orders/:orderId", updateOrderStatusBySuperUser);
//////////////////////////////////////18/09/2025//////////////////////////////////////////////
router.get("/by-brand-product",getAllOrdersByBrandAndProduct);
//router.get("/product-brand-order-stats", getProductBrandOrderStats);
router.get("/product-brand-order-stats",getProductBrandOrderStatsWithPercentage);


export default router;
