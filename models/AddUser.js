import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNo: { type: String, required: true },
  aadharCard: { type: String },
  panCard: { type: String },
  business: { type: String },
  address: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // Default role as user
  state: { type: String },
  district: { type: String },
  taluka: { type: String },
});

export const AddUser = mongoose.model("AddUser", userSchema);
