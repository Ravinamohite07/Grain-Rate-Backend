// import Product from "../models/product.model.js";

// import Price from "../models/price.model.js";
// import { Order, TraderOrder } from "../models/order.model.js";
// import { sendMessage } from "../utils/whatsappService.js";
// import User from "../models/userModel.js"; // Ensure the pathconsole.log("Order created successfully.");

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       grainId,
//       packagingSize,
//       numberOfBags,
//       partyName,
//       adminId,
//       userPhone,
//     } = req.body;

//     const totalWeight = packagingSize * numberOfBags;
//     const product = await Product.findById(grainId);
//     if (!product) return res.status(404).json({ message: "Grain not found." });

//     const grainName = product.productName;
//     const priceData = await Price.findOne({ productId: grainId });
//     if (!priceData || !priceData.prices || priceData.prices.length === 0) {
//       return res.status(404).json({ message: "Price data not available for the selected grain." });
//     }

//     const pricePerKg = priceData.prices[0].price || 0; // Now it's safe to access the price

//     const order = partyName
//       ? new TraderOrder({
//           userId,
//           grainName,
//           packagingSize,
//           numberOfBags,
//           totalWeight,
//           totalPrice,
//           partyName,
//           status: "pending",
//         })
//       : new Order({
//           userId,
//           grainName,
//           packagingSize,
//           numberOfBags,
//           totalWeight,
//           totalPrice,
//           status: "pending",
//         });

//     await order.save();

//     if (userPhone && adminId) {
//       await sendMessage(
//         adminId,
//         userPhone,
//         `Your order for ${grainName} has been placed successfully.`,
//         order
//       );
//     }

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// export const cancelOrder = async (req, res) => {
//   try {
//     const { orderId, adminId, userPhone } = req.body;

//     let order = await Order.findById(orderId);
//     if (!order) {
//       order = await TraderOrder.findById(orderId);
//     }

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     if (order.status === "accepted") {
//       return res
//         .status(400)
//         .json({ message: "Order has already been accepted, cannot cancel." });
//     }

//     order.status = "canceled";
//     await order.save();

//     if (userPhone && adminId) {
//       await sendMessage(
//         adminId,
//         userPhone,
//         `Your order for ${order.grainName} has been canceled.`,
//         order
//       );
//     }

//     res.status(200).json({ message: "Order cancelled successfully.", order });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// export const getUserOrders = async (req, res) => {
//   try {
//     const { userId } = req.params; // ID of the logged-in user

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     // Check if the logged-in user is an admin
//     const user = await User.findById(userId);  // Fetch user details
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // If the user is an admin, fetch all orders placed by their users
//     let orders;
//     if (user.userType === "admin") {
//       orders = await Order.find({ adminId: userId }).sort({ orderDate: -1 });
//       const traderOrders = await TraderOrder.find({ adminId: userId }).sort({
//         orderDate: -1,
//       });
//       orders = [...orders, ...traderOrders];
//     } else {
//       // Fetch orders for the regular user
//       orders = await Order.find({ userId }).sort({ orderDate: -1 });
//       const traderOrders = await TraderOrder.find({ userId }).sort({
//         orderDate: -1,
//       });
//       orders = [...orders, ...traderOrders];
//     }

//     if (orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user." });
//     }

//     res.status(200).json({ message: "Orders fetched successfully.", orders });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// //Fetch all orders for admin
// export const getAllOrders = async (req, res) => {
//   try {
//     const { adminId } = req.query; // Admin ID passed as query parameter

//     // If adminId is provided, fetch orders placed by users under the admin
//     const orders = await Order.find({ adminId })
//       .sort({ orderDate: -1 })
//       .populate("userId", "userType name");

//     const traderOrders = await TraderOrder.find({ adminId })
//       .sort({ orderDate: -1 })
//       .populate("userId", "userType name");

//     const allOrders = [...orders, ...traderOrders];

//     if (allOrders.length === 0) {
//       return res.status(404).json({ message: "No orders found." });
//     }

//     res.status(200).json({ message: "Orders fetched successfully.", orders: allOrders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Fetch all orders for admin with optional userType filter
// export const getAllOrdersByUserType = async (req, res) => {
//   try {
//     const { userType } = req.query; // Optional query parameter for userType

//     // Build the filter object based on userType if provided
//     const filter = userType ? { "userId.userType": userType } : {};

//     // Fetch all orders based on the filter and sort by orderDate
//     const orders = await Order.find(filter)
//       .sort({ orderDate: -1 })
//       .populate("userId", "userType name");

//     // Check if orders exist
//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found." });
//     }

//     res.status(200).json({ message: "Orders fetched successfully.", orders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Define the sendNotification function
// const sendNotification = async (userId, message) => {
//   try {
//     console.log(`Notification for User ${userId}: ${message}`);
//     // Extend this to integrate with Firebase, email, or SMS in the future
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };

// export const acceptOrder = async (req, res) => {
//   try {
//     const { adminId, userPhone } = req.body;
//     const { orderId } = req.params; // <-- FIXED: Get orderId from params

//     let order =
//       (await Order.findById(orderId)) || (await TraderOrder.findById(orderId));

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     if (order.status !== "pending") {
//       return res
//         .status(400)
//         .json({ message: "Only pending orders can be accepted." });
//     }

//     order.status = "accepted";
//     order.adminAccepted = true;
//     await order.save();

//     if (userPhone && adminId) {
//       await sendMessage(
//         adminId,
//         userPhone,
//         `Your order for ${order.grainName} has been accepted.`,
//         order
//       );
//     }

//     res.status(200).json({ message: "Order accepted successfully.", order });
//   } catch (error) {
//     console.error("Error accepting order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// export const rejectOrder = async (req, res) => {
//   try {
//     const { orderId, adminId, userPhone } = req.body;

//     let order =
//       (await Order.findById(orderId)) || (await TraderOrder.findById(orderId));
//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     if (order.status === "accepted") {
//       return res
//         .status(400)
//         .json({ message: "Order has already been accepted, cannot reject." });
//     }

//     order.status = "rejected";
//     await order.save();

//     if (userPhone && adminId) {
//       await sendMessage(
//         adminId,
//         userPhone,
//         `Your order for ${order.grainName} has been rejected.`,
//         order
//       );
//     }

//     // Optional email
//     await sendEmailNotification(
//       order.userId,
//       "Order Rejected",
//       "Your order has been rejected."
//     );

//     res.status(200).json({ message: "Order rejected successfully.", order });
//   } catch (error) {
//     console.error("Error rejecting order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// // Super User accepts the order and changes status to 'dispatched'
// // export const superUserAcceptOrder = async (req, res) => {
// //   try {
// //     const { orderId } = req.params;

// //     const order = await Order.findById(orderId);
// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (!order.adminAccepted) {
// //       return res.status(400).json({ message: "Order has not been accepted by admin yet." });
// //     }

// //     if (order.orderStatus === "dispatched") {
// //       return res.status(400).json({ message: "Order is already dispatched." });
// //     }

// //     // Change the order status to 'dispatched'
// //     order.orderStatus = "dispatched";
// //     await order.save();

// //     // Send notification to the user
// //     await sendEmailNotification(order.userId, 'Order Dispatched', 'Your order has been dispatched and is on the way.');

// //     res.status(200).json({ message: "Order dispatched successfully", order });
// //   } catch (error) {
// //     console.error("Error updating order:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // };

// // // Fetch orders for Super User
// // export const getOrdersForSuperUser = async (req, res) => {
// //   try {
// //     // Fetch orders accepted by admin but not yet dispatched
// //     const orders = await Order.find({
// //       adminAccepted: true,
// //       orderStatus: "pending",
// //     });

// //     res.status(200).json({ orders });
// //   } catch (err) {
// //     console.error("Error fetching orders:", err);
// //     res.status(500).json({ message: "Server error while fetching orders" });
// //   }
// // };
// export const getOrdersForSuperUser = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       adminAccepted: true,
//       status: "accepted",
//     }).populate("userId", "name email");
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching orders", error });
//   }
// };

// // Superuser updates order status to dispatched or rejected
// export const updateOrderStatusBySuperUser = async (req, res) => {
//   const { orderId } = req.params;
//   const { status, adminId, userPhone } = req.body;

//   if (!["dispatched", "rejected"].includes(status)) {
//     return res.status(400).json({ message: "Invalid status update" });
//   }

//   try {
//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (!order.adminAccepted) {
//       return res
//         .status(400)
//         .json({ message: "Order must be accepted by admin first" });
//     }

//     order.status = status;
//     order.superUserAction = true;
//     await order.save();

//     if (userPhone && adminId) {
//       await sendMessage(
//         adminId,
//         userPhone,
//         `Your order for ${order.grainName} is now ${status}.`,
//         order
//       );
//     }

//     res.status(200).json({ message: `Order ${status} successfully`, order });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating order", error });
//   }
// };

///////////////////////////////////// 29/07/2025 /////////////////////////////////////

import Product from "../models/product.model.js";
//import TraderOrder from "../models/traderorder.model.js";
import Price from "../models/price.model.js";
import { Order, TraderOrder } from "../models/order.model.js";
//import { sendMessage } from "../utils/whatsappService.js";
import User from "../models/userModel.js";
//import { sendMessage } from '../utils/whatsappService.js';

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       grainId,
//       packagingSize,
//       numberOfBags,
//       partyName,
//       userPhone,
//     } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const totalWeight = packagingSize * numberOfBags;
//     const product = await Product.findById(grainId);
//     if (!product) return res.status(404).json({ message: "Grain not found." });

//     const grainName = product.productName;
//     const priceData = await Price.findOne({ productId: grainId });
//     if (!priceData || priceData.price === undefined) {
//       // Check if priceData exists and has a price
//       return res
//         .status(404)
//         .json({ message: "Price data not available for the selected grain." });
//     }

//     const pricePerKg = priceData.price; // Access the price directly

//     //const pricePerKg = priceData.prices[0].price || 0;

//     //const pricePerKg = priceData.prices[0].price || 0;
//     const totalPrice = pricePerKg * totalWeight;

//     let parentUser = null;
//     if (user.createdBy) {
//       parentUser = user.createdBy;
//     }

//     const order = partyName
//       ? new TraderOrder({
//           userId,
//           parentUser, // Set the parent user
//           grainName,
//           packagingSize,
//           numberOfBags,
//           totalWeight,
//           totalPrice,
//           partyName,
//           status: "pending",
//         })
//       : new Order({
//           userId,
//           parentUser, // Set the parent user
//           grainName,
//           packagingSize,
//           numberOfBags,
//           totalWeight,
//           totalPrice,
//           status: "pending",
//         });

//     await order.save();

//     // Send message to the parent user (creator)
//     // if (user.createdBy) {
//     //   const parent = await User.findById(user.createdBy);
//     //   if (parent && parent.phone) {
//     //     await sendMessage(
//     //       parent._id.toString(), // Assuming sendMessage expects the recipient's user ID
//     //       parent.phone,
//     //       `New order placed by user ${user.name} for ${grainName}. Order ID: ${order._id}`,
//     //       order
//     //     );
//     //     // Optionally, you can still send a confirmation to the user who placed the order
//     //     if (userPhone) {
//     //       await sendMessage(
//     //         userId,
//     //         userPhone,
//     //         `Your order for ${grainName} has been placed successfully. Order ID: ${order._id}`,
//     //         order
//     //       );
//     //     }
//     //   }
//     // } else if (user.userType === "admin" && userPhone) {
//     //   // If the user is an admin and has no creator, perhaps they are placing an order for themselves or it's a special case.
//     //   // You might want to handle this differently based on your exact requirements.
//     //   await sendMessage(
//     //     userId,
//     //     userPhone,
//     //     `Your order for ${grainName} has been placed successfully. Order ID: ${order._id}`,
//     //     order
//     //   );
//     // }

//     // Send confirmation to the user who placed the order
//     // ✅ Send WhatsApp message after order is created
//     if (userPhone) {
//       await sendMessage(
//         userPhone,
//         `Your order for ${grainName} has been placed successfully.`,
//         order
//       );
//     }

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
//////////////////////// 29/07/2025////////////////////////////////////////

// In your backend order controller file (e.g., /controllers/orderController.js)

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       grainId,
//       packagingSize,
//       numberOfBags,
//       partyName,
//       dispatchStartDate,
//       dispatchEndDate,
//     } = req.body;

//     // --- NEW VALIDATION LOGIC BASED ON USER ROLE ---

//     // First, find the user to check their role
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     let start = null;
//     let end = null;

//     // RULE 1: If the user is a 'trader', dates are COMPULSORY.
//     if (user.role === "trader") {
//       if (!dispatchStartDate || !dispatchEndDate) {
//         return res.status(400).json({
//           message: "Dispatch start and end dates are required for traders.",
//         });
//       }

//       start = new Date(dispatchStartDate);
//       end = new Date(dispatchEndDate);

//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res
//           .status(400)
//           .json({ message: "Invalid date format. Use YYYY-MM-DD." });
//       }
//       if (end < start) {
//         return res.status(400).json({
//           message: "dispatchEndDate must be after dispatchStartDate.",
//         });
//       }
//     }
//     // RULE 2: For all other roles, dates are OPTIONAL.
//     // We only validate them if they are provided.
//     else if (dispatchStartDate && dispatchEndDate) {
//       start = new Date(dispatchStartDate);
//       end = new Date(dispatchEndDate);

//       if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//         return res
//           .status(400)
//           .json({ message: "Invalid date format if provided." });
//       }
//       if (end < start) {
//         return res.status(400).json({
//           message:
//             "If provided, dispatchEndDate must be after dispatchStartDate.",
//         });
//       }
//     }
//     // --- END OF NEW VALIDATION LOGIC ---

//     // The rest of the controller logic remains the same
//     const totalWeight = packagingSize * numberOfBags;
//     const product = await Product.findById(grainId);
//     if (!product) {
//       return res.status(404).json({ message: "Grain not found." });
//     }

//     const grainName = product.productName;
//     const brandName = product.brandName || null;
//     const priceData = await Price.findOne({ productId: grainId });
//     if (!priceData || priceData.price === undefined) {
//       return res
//         .status(404)
//         .json({ message: "Price data not available for the selected grain." });
//     }

//     const pricePerKg = priceData.price;
//     const totalPrice = pricePerKg * totalWeight;
//     const parentUser = user.createdBy || null;

//     const orderData = {
//       userId,
//       parentUser,
//       grainName,
//       brandName,
//       packagingSize,
//       numberOfBags,
//       totalWeight,
//       totalPrice,
//       status: "pending",
//       dispatchStartDate: start, // Will be a Date object or null
//       dispatchEndDate: end, // Will be a Date object or null
//     };

//     if (partyName) {
//       orderData.partyName = partyName;
//     }

//     const order = partyName ? new TraderOrder(orderData) : new Order(orderData);
//     await order.save();

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };/
// ---------------- 06/08/2025 ----------------

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       grainId,
//       packagingSize,
//       numberOfBags,
//       partyName,
//       userPhone,
//       dispatchStartDate,
//       dispatchEndDate,
//     } = req.body;

//     if (!dispatchStartDate || !dispatchEndDate) {
//       return res
//         .status(400)
//         .json({ message: "Dispatch start and end dates are required." });
//     }

//     const start = new Date(dispatchStartDate);
//     const end = new Date(dispatchEndDate);

//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       return res
//         .status(400)
//         .json({ message: "Invalid date format. Use YYYY-MM-DD." });
//     }

//     if (end < start) {
//       return res.status(400).json({
//         message: "dispatchEndDate must be after or equal to dispatchStartDate.",
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const totalWeight = packagingSize * numberOfBags;
//     const product = await Product.findById(grainId);
//     if (!product) {
//       return res.status(404).json({ message: "Grain not found." });
//     }

//     const grainName = product.productName;
//     const brandName = product.brandName || null;

//     // Fetch price for the grain
//     const priceData = await Price.findOne({ productId: grainId });
//     if (!priceData || priceData.price === undefined) {
//       return res
//         .status(404)
//         .json({ message: "Price data not available for the selected grain." });
//     }

//     const price = priceData.price; // Could be per kg or per quintal — depends on your business logic
//     const totalPrice = price * totalWeight;
//     let parentUser = null;
//     if (user.createdBy) {
//       parentUser = user.createdBy;
//     }

//     const orderData = {
//       userId,
//       parentUser,
//       grainName,
//       brandName,
//       packagingSize,
//       numberOfBags,
//       totalWeight,
//       totalPrice,
//       price, // ✅ Only storing price, not totalPrice
//       status: "pending",
//       dispatchStartDate: start,
//       dispatchEndDate: end,
//     };

//     if (partyName) {
//       orderData.partyName = partyName;
//     }

//     const order = partyName ? new TraderOrder(orderData) : new Order(orderData);

//     await order.save();

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
// In your backend file: C:/GrainRate_App/GrainRateBackend/controllers/order.controller.js

// export const createOrder = async (req, res) => {
//   try {
//     const {
//       userId,
//       grainId,
//       packagingSize,
//       numberOfBags,
//       partyName,
//       dispatchStartDate,
//       dispatchEndDate,
//     } = req.body;

//     // --- All your validation code is correct and stays the same ---
//     if (!dispatchStartDate || !dispatchEndDate) {
//       return res
//         .status(400)
//         .json({ message: "Dispatch start and end dates are required." });
//     }
//     const start = new Date(dispatchStartDate);
//     const end = new Date(dispatchEndDate);
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       return res.status(400).json({ message: "Invalid date format." });
//     }
//     if (end < start) {
//       return res
//         .status(400)
//         .json({
//           message:
//             "dispatchEndDate must be after or equal to dispatchStartDate.",
//         });
//     }
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     const product = await Product.findById(grainId);
//     if (!product) {
//       return res.status(404).json({ message: "Grain not found." });
//     }
//     const priceData = await Price.findOne({ productId: grainId });
//     if (!priceData || priceData.price === undefined) {
//       return res
//         .status(404)
//         .json({ message: "Price data not available for the selected grain." });
//     }
//     // --- End of validation ---

//     // --- THIS IS THE CORRECTED CALCULATION LOGIC ---

//     // 1. Calculate total weight in KG (this is correct)
//     const totalWeightInKg = packagingSize * numberOfBags;

//     // 2. THE FIX: Convert weight from KG to Quintals
//     const totalWeightInQuintals = totalWeightInKg / 100;

//     // 3. Get the price (rate per quintal) from your database
//     const pricePerQuintal = priceData.price;

//     // 4. Calculate the final total price correctly
//     const finalTotalPrice = totalWeightInQuintals * pricePerQuintal;

//     // --- End of corrected calculation ---

//     const grainName = product.productName;
//     const brandName = product.brandName || null;
//     let parentUser = user.createdBy || null;

//     const orderData = {
//       userId,
//       parentUser,
//       grainName,
//       brandName,
//       packagingSize,
//       numberOfBags,
//       totalWeight: totalWeightInKg, // Save the weight in KG
//       price: pricePerQuintal, // Save the rate per quintal
//       totalPrice: finalTotalPrice, // Save the CORRECT total price
//       status: "pending",
//       dispatchStartDate: start,
//       dispatchEndDate: end,
//     };

//     if (partyName) {
//       orderData.partyName = partyName;
//     }

//     const order = partyName ? new TraderOrder(orderData) : new Order(orderData);
//     await order.save();

//     res.status(201).json({ message: "Order created successfully.", order });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      grainId,
      numberOfBags,
      partyName,
      dispatchStartDate,
      dispatchEndDate,
    } = req.body;

    if (!dispatchStartDate || !dispatchEndDate) {
      return res
        .status(400)
        .json({ message: "Dispatch start and end dates are required." });
    }
    const start = new Date(dispatchStartDate);
    const end = new Date(dispatchEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }
    if (end < start) {
      return res
        .status(400)
        .json({
          message:
            "dispatchEndDate must be after or equal to dispatchStartDate.",
        });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetched product to get its details
    const product = await Product.findById(grainId);
    if (!product) {
      return res.status(404).json({ message: "Grain not found." });
    }

    // Fetched price data based on the product
    const priceData = await Price.findOne({ productId: grainId });
    if (!priceData || priceData.price === undefined) {
      return res
        .status(404)
        .json({ message: "Price data not available for the selected grain." });
    }

    // **HERE IS THE CHANGE:** Get packagingSize from the product, just like price is from priceData
    const packagingSize = product.packagingSize; 
    if (!packagingSize) {
        return res.status(404).json({ message: "Packaging size is not defined for this grain." });
    }

    // --- Calculation Logic ---
    const totalWeightInKg = packagingSize * numberOfBags;
    const totalWeightInQuintals = totalWeightInKg / 100;
    const pricePerQuintal = priceData.price;
    const finalTotalPrice = totalWeightInQuintals * pricePerQuintal;

    // --- Order Creation ---
    const grainName = product.productName;
    const brandName = product.brandName || null;
    const unitType = product.unitType || "kg";
    let parentUser = user.createdBy || null;

    const orderData = {
      userId,
      parentUser,
      grainName,
      brandName,
      packagingSize, // Using the packagingSize fetched from the product
      unitType, 
      numberOfBags,
      totalWeight: totalWeightInKg,
      price: pricePerQuintal,
      totalPrice: finalTotalPrice,
      status: "pending",
      dispatchStartDate: start,
      dispatchEndDate: end,
    };

    if (partyName) {
      orderData.partyName = partyName;
    }

    const order = partyName ? new TraderOrder(orderData) : new Order(orderData);
    await order.save();

    res.status(201).json({ message: "Order created successfully.", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// export const cancelOrder = async (req, res) => {
//   try {
//     const { orderId, adminId, userPhone } = req.body; // Consider if adminId is still relevant here

//     let order = await Order.findById(orderId);
//     if (!order) {
//       order = await TraderOrder.findById(orderId);
//     }

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     if (order.status === "accepted") {
//       return res
//         .status(400)
//         .json({ message: "Order has already been accepted, cannot cancel." });
//     }

//     order.status = "canceled";
//     await order.save();

//     // Notify the parent user about the cancellation
//     if (order.parentUser) {
//       const parent = await User.findById(order.parentUser);
//       if (parent && parent.phone) {
//         await sendMessage(
//           parent._id.toString(),
//           parent.phone,
//           `Order ID ${order._id} for ${order.grainName} placed by user ${order.userId} has been canceled.`,
//           order
//         );
//       }
//     }
//     // Optionally, notify the user who canceled
//     if (userPhone && adminId) {
//       // Consider if adminId is the right recipient here
//       await sendMessage(
//         adminId, // Should this be the order creator or the user who cancelled?
//         userPhone,
//         `Your order for ${order.grainName} has been canceled. Order ID: ${order._id}`,
//         order
//       );
//     }

//     res.status(200).json({ message: "Order cancelled successfully.", order });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// export const getUserOrders = async (req, res) => {
//   try {
//     const { userId } = req.params; // ID of the logged-in user

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     let orders;
//     // If the user is an admin, trader, or distributor, fetch orders directed to them (where parentUser is their ID)
//     if (["admin", "trader", "distributor"].includes(user.userType)) {
//       orders = await Order.find({ parentUser: userId }).sort({ orderDate: -1 });
//       const traderOrders = await TraderOrder.find({ parentUser: userId }).sort({
//         orderDate: -1,
//       });
//       orders = [...orders, ...traderOrders];
//     } else {
//       // If it's a regular user, fetch their own orders (where userId is their ID)
//       orders = await Order.find({ userId }).sort({ orderDate: -1 });
//       const traderOrders = await TraderOrder.find({ userId }).sort({
//         orderDate: -1,
//       });
//       orders = [...orders, ...traderOrders];
//     }

//     if (orders.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No orders found for this user." });
//     }

//     res.status(200).json({ message: "Orders fetched successfully.", orders });
//   } catch (error) {
//     console.error("Error fetching user orders:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

// export const cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     let order = await Order.findById(orderId);
//     if (!order) {
//       order = await TraderOrder.findById(orderId);
//     }

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     const wasAccepted = order.status === "accepted";

//     // Change status to canceled
//     order.status = "canceled";
//     await order.save();

//     // Prepare message for frontend
//     const userMessage = wasAccepted
//       ? `Your order for ${order.grainName} was already accepted but has now been canceled. Order ID: ${order._id}`
//       : `Your order for ${order.grainName} has been canceled successfully. Order ID: ${order._id}`;

//     res.status(200).json({
//       message: userMessage, // ✅ Send message directly
//       order,
//     });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
// export const cancelOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     let order = await Order.findById(orderId);
//     if (!order) {
//       order = await TraderOrder.findById(orderId);
//     }

//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     const wasAccepted = order.status === "accepted";

//     // Prepare cancellation reason
//     const cancellationReason = wasAccepted
//       ? `Your order for ${order.grainName} was already accepted but has now been canceled. Order ID: ${order._id}`
//       : `Your order for ${order.grainName} has been canceled successfully. Order ID: ${order._id}`;

//     // Change status to canceled and store cancellation reason
//     order.status = "canceled";
//     order.cancellationReason = cancellationReason;

//     await order.save();

//     res.status(200).json({
//       message: cancellationReason,
//       order,
//     });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };
export const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body; // ✅ Accept reason from frontend

    let order = await Order.findById(orderId);
    if (!order) {
      order = await TraderOrder.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // ✅ Instead of generating reason here, use frontend-provided reason
    order.status = "canceled";
    order.cancellationReason = reason || "Order canceled by user"; // fallback

    await order.save();

    res.status(200).json({
      message: "Order canceled successfully",
      order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let orders = [];
    let traderOrders = [];

    if (["admin", "trader", "distributor"].includes(user.userType)) {
      // Fetch as parentUser
      orders = await Order.find({ parentUser: userId })
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 });

      traderOrders = await TraderOrder.find({ parentUser: userId })
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 });
    } else {
      // Fetch as order owner (userId)
      orders = await Order.find({ userId })
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 });

      traderOrders = await TraderOrder.find({ userId })
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 });
    }

    const allOrders = [...orders, ...traderOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const formattedOrders = allOrders.map((order) => ({
      _id: order._id,
      grainName: order.grainName,
      packagingSize: order.packagingSize,
      numberOfBags: order.numberOfBags,
      totalWeight: order.totalWeight,
      totalPrice: order.totalPrice,
      price: order.price,
      status: order.status,
      cancellationReason: order.cancellationReason || null,
      orderDate: order.createdAt,
      dispatchStartDate: order.dispatchStartDate,
      dispatchEndDate: order.dispatchEndDate,
      partyName: order.partyName || null,
      brandName: order.brandName || null,
      username: order.userId?.username || "N/A", // Ensure safe access
      role: order.userId?.role || "N/A",
      firstName: order.userId?.firstName || "N/A",
      lastName: order.userId?.lastName || "N/A",
    }));

    if (formattedOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json({
      message: "Orders fetched successfully.",
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//Fetch all orders for a specific parent user (Admin, Trader, Distributor)
// export const getAllOrders = async (req, res) => {
//   try {
//     const { parentUserId } = req.query; // Parent User ID passed as query parameter

//     if (!parentUserId) {
//       return res.status(400).json({ message: "Parent User ID is required." });
//     }

//     const orders = await Order.find({ parentUser: parentUserId })
//       .sort({ orderDate: -1 })
//       .populate("userId", "userType name");

//     const traderOrders = await TraderOrder.find({ parentUser: parentUserId })
//       .sort({ orderDate: -1 })
//       .populate("userId", "userType name");

//     const allOrders = [...orders, ...traderOrders];

//     if (allOrders.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No orders found for this user." });
//     }

//     res
//       .status(200)
//       .json({ message: "Orders fetched successfully.", orders: allOrders });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

export const getAllOrders = async (req, res) => {
  try {
    const { parentUserId } = req.query;
    if (!parentUserId) {
      return res
        .status(400)
        .json({ message: "Parent user ID is required to fetch orders." });
    }

    // Use Promise.all to fetch from both Order and TraderOrder collections concurrently
    const [regularOrders, traderOrders] = await Promise.all([
      // Fetch orders from non-traders
      Order.find({ parentUser: parentUserId })
        .populate("userId", "username role firstName lastName") // Populate to get username and role
        .sort({ createdAt: -1 }), // Sort by newest first

      // Fetch orders from traders
      TraderOrder.find({ parentUser: parentUserId })
        .populate("userId", "username role firstName lastName") // Also populate here
        .sort({ createdAt: -1 }),
    ]);

    // Combine the results from both queries into a single array
    const allOrders = [...regularOrders, ...traderOrders];

    // Sort the combined array again to ensure perfect chronological order
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Map the results to a consistent format for the frontend
    // This ensures the frontend receives the same structure for every order
    const formattedOrders = allOrders.map((order) => ({
      _id: order._id,
      grainName: order.grainName,
      packagingSize: order.packagingSize,
      numberOfBags: order.numberOfBags,
      totalWeight: order.totalWeight,
      price: order.price,
      totalPrice: order.totalPrice,
      status: order.status,
      orderDate: order.createdAt, // Use createdAt for a consistent order date
      dispatchStartDate: order.dispatchStartDate,
      dispatchEndDate: order.dispatchEndDate,

      // Conditionally add partyName. It will be null for non-trader orders.
      partyName: order.partyName || null,
      brandName: order.brandName || null,

      // Add user info from the populated 'userId' field
      // username: order.userId ? order.userId.username : "N/A",
      // role: order.userId ? order.userId.role : "N/A",
      username:
        order.userId && order.userId.username ? order.userId.username : "N/A",
      role: order.userId && order.userId.role ? order.userId.role : "N/A",
      firstName: order.userId?.firstName || "N/A",
      lastName: order.userId?.lastName || "N/A",
    }));

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

// Fetch all orders for admin with optional userType filter (now filtering by the actual user who placed the order)
export const getAllOrdersByUserType = async (req, res) => {
  try {
    const { userType } = req.query; // Optional query parameter for userType

    const filter = userType ? { "userId.userType": userType } : {};

    const orders = await Order.find(filter)
      .sort({ orderDate: -1 })
      .populate("userId", "userType name");

    const traderOrders = await TraderOrder.find(filter)
      .sort({ orderDate: -1 })
      .populate("userId", "userType name");

    const allOrders = [...orders, ...traderOrders];

    if (!allOrders || allOrders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res
      .status(200)
      .json({ message: "Orders fetched successfully.", orders: allOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const sendNotification = async (userId, message) => {
  try {
    console.log(`Notification for User ${userId}: ${message}`);
    // Extend this to integrate with Firebase, email, or SMS in the future
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { adminId, userPhone } = req.body; // Consider if adminId is the acceptor, should match parentUser
    const { orderId } = req.params;

    let order =
      (await Order.findById(orderId)) || (await TraderOrder.findById(orderId));

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Verify if the accepting user is the parentUser of this order
    if (adminId !== order.parentUser.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this order." });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be accepted." });
    }

    order.status = "accepted";
    order.adminAccepted = true;
    await order.save();

    // Notify the user who placed the order
    const user = await User.findById(order.userId);
    if (user && user.phone) {
      await sendMessage(
        user._id.toString(),
        user.phone,
        `Your order for ${order.grainName} (Order ID: ${order._id}) has been accepted.`,
        order
      );
    }

    res.status(200).json({ message: "Order accepted successfully.", order });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// In order.controller.js

export const rejectOrder = async (req, res) => {
  try {
    // ✅ CORRECTLY get orderId from URL parameters
    const { orderId } = req.params;
    // ✅ CORRECTLY get adminId from the request body
    const { adminId } = req.body;

    // Find the order in either collection
    let order = await Order.findById(orderId);
    if (!order) {
      order = await TraderOrder.findById(orderId);
    }

    // If it's still not found, return 404
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Verify if the rejecting user is the parentUser of this order
    // Using .toString() is important as parentUser is an ObjectId
    if (adminId !== order.parentUser.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reject this order." });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be rejected." });
    }

    order.status = "rejected";
    await order.save();

    // Notify the user who placed the order
    const user = await User.findById(order.userId);
    if (user && user.phone) {
      // Your sendMessage logic here...
      // await sendMessage(...)
    }

    res.status(200).json({ message: "Order rejected successfully.", order });
  } catch (error) {
    console.error("Error rejecting order:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// export const rejectOrder = async (req, res) => {
//   try {
//     const { orderId, adminId, userPhone } = req.body; // Consider if adminId is the rejector, should match parentUser

//     let order =
//       (await Order.findById(orderId)) || (await TraderOrder.findById(orderId));
//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     // Verify if the rejecting user is the parentUser of this order
//     if (adminId !== order.parentUser.toString()) {
//       return res
//         .status(403)
//         .json({ message: "You are not authorized to reject this order." });
//     }

//     if (order.status === "accepted") {
//       return res
//         .status(400)
//         .json({ message: "Order has already been accepted, cannot reject." });
//     }

//     order.status = "rejected";
//     await order.save();

//     // Notify the user who placed the order
//     const user = await User.findById(order.userId);
//     if (user && user.phone) {
//       await sendMessage(
//         user._id.toString(),
//         user.phone,
//         `Your order for ${order.grainName} (Order ID: ${order._id}) has been rejected.`,
//         order
//       );
//     }

//     // Optional email notification (you'll need to implement sendEmailNotification)
//     // await sendEmailNotification(
//     //   order.userId,
//     //   "Order Rejected",
//     //   "Your order has been rejected."
//     // );

//     res.status(200).json({ message: "Order rejected successfully.", order });
//   } catch (error) {
//     console.error("Error rejecting order:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

export const getOrdersForSuperUser = async (req, res) => {
  try {
    const orders = await Order.find({
      adminAccepted: true,
      status: "accepted",
    }).populate("userId", "name email parentUser"); // Populate parentUser as well
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const updateOrderStatusBySuperUser = async (req, res) => {
  const { orderId } = req.params;
  const { status, adminId, userPhone } = req.body;

  if (!["dispatched", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status update" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.adminAccepted) {
      return res
        .status(400)
        .json({ message: "Order must be accepted by admin first" });
    }

    order.status = status;
    order.superUserAction = true;
    await order.save();

    if (userPhone && adminId) {
      // Your sendMessage logic
    }

    res.status(200).json({ message: `Order ${status} successfully`, order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
}; // <-- MAKE SURE THIS FUNCTION IS CLOSED HERE

export const getOrderCount = async (req, res) => {
  try {
    const user = req.user;

    //  Check if the logged-in user is an admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const [regularOrders, traderOrders] = await Promise.all([
      Order.countDocuments({ parentUser: user._id }),
      TraderOrder.countDocuments({ parentUser: user._id }),
    ]);

    const totalCount = regularOrders + traderOrders;

    res.status(200).json({ count: totalCount });
  } catch (error) {
    console.error("Error in getOrderCount controller:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching order count." });
  }
};
//////////////////////////////////////18/09/2025/////////////////////////////////////////////////////
export const getAllOrdersByBrandAndProduct = async (req, res) => {
  try {
    const { brandName, grainName } = req.query; // both optional filters

    // Build a dynamic filter object
    const filter = {};
    if (brandName) filter.brandName = brandName;
    if (grainName) filter.grainName = grainName;

    // Fetch from both collections concurrently
    const [regularOrders, traderOrders] = await Promise.all([
      Order.find(filter)
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 }),

      TraderOrder.find(filter)
        .populate("userId", "username role firstName lastName")
        .sort({ createdAt: -1 }),
    ]);

    const allOrders = [...regularOrders, ...traderOrders];

    if (!allOrders.length) {
      return res.status(404).json({ message: "No orders found for the given criteria." });
    }

    // Format the result to keep it consistent
    const formattedOrders = allOrders.map((order) => ({
      _id: order._id,
      grainName: order.grainName,
      brandName: order.brandName,
      packagingSize: order.packagingSize,
      numberOfBags: order.numberOfBags,
      totalWeight: order.totalWeight,
      price: order.price,
      totalPrice: order.totalPrice,
      status: order.status,
      orderDate: order.createdAt,
      dispatchStartDate: order.dispatchStartDate,
      dispatchEndDate: order.dispatchEndDate,
      partyName: order.partyName || null,
      username: order.userId?.username || "N/A",
      role: order.userId?.role || "N/A",
      firstName: order.userId?.firstName || "N/A",
      lastName: order.userId?.lastName || "N/A",
    }));

    return res.status(200).json({
      message: "Orders fetched successfully.",
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders by brand/product:", error);
    res.status(500).json({ message: "Server error while fetching orders." });
  }
};

// // ✅ Controller for getting product + brand wise order counts
// export const getProductBrandOrderStats = async (req, res) => {
//   try {
//     const stats = await Order.aggregate([
//       {
//         $group: {
//           _id: {
//             product: "$grainName", // Product name
//             brand: "$brandName",   // Brand name
//           },
//           totalOrders: { $sum: 1 }, // Count orders
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           productName: "$_id.product",
//           brandName: "$_id.brand",
//           totalOrders: 1,
//         },
//       },
//       {
//         $sort: { productName: 1, brandName: 1 }, // sort nicely
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: stats,
//     });
//   } catch (error) {
//     console.error("Error in getProductBrandOrderStats:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// ✅ Controller for getting product + brand wise order counts + percentages
export const getProductBrandOrderStatsWithPercentage = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: {
            product: "$grainName", // Product name
            brand: "$brandName",   // Brand name
          },
          totalOrders: { $sum: 1 }, // Count orders
        },
      },
      {
        $project: {
          _id: 0,
          productName: "$_id.product",
          brandName: "$_id.brand",
          totalOrders: 1,
        },
      },
      {
        $sort: { productName: 1, brandName: 1 },
      },
    ]);

    // ✅ Calculate total orders across all product-brand combos
    const totalOrders = stats.reduce((acc, curr) => acc + curr.totalOrders, 0);

    // ✅ Add percentage field to each record
    const statsWithPercentage = stats.map((item) => ({
      ...item,
      percentage: totalOrders === 0 ? 0 : parseFloat(((item.totalOrders / totalOrders) * 100).toFixed(1)),
    }));

    res.status(200).json({
      success: true,
      totalOrders,
      data: statsWithPercentage,
    });
  } catch (error) {
    console.error("Error in getProductBrandOrderStatsWithPercentage:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

