// // import mongoose from "mongoose";

// // // Base Order Schema
// // const orderSchema = new mongoose.Schema({
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   grainName: { type: String, required: true },
// //   packagingSize: { type: Number, required: true }, // in kg
// //   totalWeight: { type: Number, required: true }, // in kg
// //   numberOfBags: { type: Number, required: true },
// //   totalPrice: { type: Number, required: true }, // Total price for the order (calculated from price per kg * total weight)
// //   orderDate: { type: Date, default: Date.now },
// //   orderStatus: {
// //     type: String,
// //     enum: ["pending", "shipped", "delivered", "canceled", "accepted", "rejected"],
// //     default: "pending",
// //   },
// // });

// // // Trader Order Schema extending the base schema
// // const traderOrderSchema = new mongoose.Schema({
// //   ...orderSchema.obj,
// //   partyName: { type: String, required: true }, // Extra field for trader orders
// // });

// // const Order = mongoose.model("Order", orderSchema);
// // const TraderOrder = mongoose.model("TraderOrder", traderOrderSchema);

// // export { Order, TraderOrder };

// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     grainName: { type: String, required: true },
//     packagingSize: { type: Number, required: true }, // in kg
//     totalWeight: { type: Number, required: true }, // in kg
//     numberOfBags: { type: Number, required: true },
//     totalPrice: { type: Number, required: true }, // Total price for the order (calculated from price per kg * total weight)
//     orderDate: { type: Date, default: Date.now },
//     //product: { type: String, required: true },
//     //quantity: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "accepted", "rejected", "dispatched", "canceled"],
//       default: "pending",
//     },
//     adminAccepted: { type: Boolean, default: false },
//     superUserAction: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// const traderOrderSchema = new mongoose.Schema({
//   ...orderSchema.obj,
//   partyName: { type: String, required: true }, // Extra field for trader orders
// });

// const Order = mongoose.model("Order", orderSchema);
// const TraderOrder = mongoose.model("TraderOrder", traderOrderSchema);

// export { Order, TraderOrder };
//

//--------------------------------- Old code Change on 09/07/2025 ----------------------------------
// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     parentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Added field to track who the order goes to
//     grainName: { type: String, required: true },
//     packagingSize: { type: Number, required: true }, // in kg
//     totalWeight: { type: Number, required: true }, // in kg
//     numberOfBags: { type: Number, required: true },
//     totalPrice: { type: Number, required: true }, // Total price for the order (calculated from price per kg * total weight)
//     orderDate: { type: Date, default: Date.now },
//     status: {
//       type: String,
//       enum: ["pending", "accepted", "rejected", "dispatched", "canceled"],
//       default: "pending",
//     },
//     adminAccepted: { type: Boolean, default: false },
//     superUserAction: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// const traderOrderSchema = new mongoose.Schema({
//   ...orderSchema.obj,
//   partyName: { type: String, required: true }, // Extra field for trader orders
// });

// const Order = mongoose.model("Order", orderSchema);
// const TraderOrder = mongoose.model("TraderOrder", traderOrderSchema);

// export { Order, TraderOrder };

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grainName: { type: String, required: true },
    brandName: { type: String, required: true },
    packagingSize: { type: Number, required: true },
    unitType: { type: String, required: true },
    totalWeight: { type: Number, required: true },
    numberOfBags: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    price: { type: Number, required: true }, // price per kg
    orderDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "dispatched", "canceled"],
      default: "pending",
    },
    adminAccepted: { type: Boolean, default: false },
    superUserAction: { type: Boolean, default: false },
    dispatchStartDate: { type: Date },
    dispatchEndDate: { type: Date },
    // ✅ New field for cancellation reason
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
    // ✅ THIS IS THE FIX: Explicitly tell Mongoose which collection to use for this schema.
    collection: "orders",
  }
);

const traderOrderSchema = new mongoose.Schema(
  {
    ...orderSchema.obj,
    partyName: { type: String, required: true },
    //dispatchStartDate: { type: Date, required: true },
    //dispatchEndDate: { type: Date, required: true },
  },
  {
    timestamps: true,
    // ✅ AND THIS IS THE FIX for the other model.
    collection: "traderorders",
  }
);

const Order = mongoose.model("Order", orderSchema);
const TraderOrder = mongoose.model("TraderOrder", traderOrderSchema);

export { Order, TraderOrder };
