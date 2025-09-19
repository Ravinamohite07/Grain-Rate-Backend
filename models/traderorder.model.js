import mongoose from "mongoose";

// Base Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  grainName: { type: String, required: true },
  brandName: { type: String, required: true },
  packagingSize: { type: Number, required: true }, // in kg
  totalWeight: { type: Number, required: true }, // in kg
  numberOfBags: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // Total price for the order (calculated from price per kg * total weight)
  orderDate: { type: Date, default: Date.now },
  // ✅ New field for cancellation reason
  cancellationReason: { type: String },
  orderStatus: {
    type: String,
    enum: [
      "pending",
      "shipped",
      "delivered",
      "canceled",
      "accepted",
      "rejected",
    ],
    default: "pending",
  },
});

// Trader Order Schema extending the base schema
const traderOrderSchema = new mongoose.Schema({
  ...orderSchema.obj,
  partyName: { type: String, required: true },
  // dispatchStartDate: { type: Date, required: true },
  // dispatchEndDate: { type: Date, required: true }, // Extra field for trader orders
});

const Order = mongoose.model("Order", orderSchema);
const TraderOrder = mongoose.model("TraderOrder", traderOrderSchema);

export { Order, TraderOrder };
