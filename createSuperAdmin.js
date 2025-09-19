// createSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js"; // make sure User.js exports a default ES module

const MONGO_URI = "mongodb://localhost:27017/grain-rate"; // replace with your actual DB name

await mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSuperAdmin() {
  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  await User.create({
    username: "shrifood",
    password: hashedPassword,
    phoneNo: "9999999999",
    email: "superadmin@gmail.com",
    role: "superadmin",
    status: "accepted",
  });

  console.log("✅ SuperAdmin created");
  await mongoose.disconnect();

}

createSuperAdmin();
