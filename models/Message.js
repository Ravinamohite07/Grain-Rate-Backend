import mongoose from "mongoose";

// Define Message Schema
const messageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userTypes: {
      type: [String],
      required: true,
      enum: ["Farmer", "Trader", "Distributor", "Retailer", "Individual"],
    },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
