// import mongoose  from "mongoose";

// export const connectionDB = async () =>{
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDB Connected:${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error:${error.message}`);
//         process.exit(1); // 1failure and 0 mean success
//     }
// }

// db.js

/////////// current use code //////////////////////////
// import mongoose from "mongoose";

// export const connectionDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };
///////////////////// latest use code////////////////////////////////////
// import mongoose from "mongoose";

// export const connectionDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.error("MongoDB connection failed:", error);
//     process.exit(1);
//   }
// };
import mongoose from "mongoose";

export const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // No need to include deprecated options like useNewUrlParser or useUnifiedTopology
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit the process with failure
  }
};
