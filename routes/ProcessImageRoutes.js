// import express from "express";
// import multer from "multer";
// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // **************************** CHANGE 1: Flask Backend URLs ****************************
// // These are the INTERNAL URLs that your Node.js app will use to call the Flask apps.
// // Based on your latest clarification: Toor is 5000, Toor Dal is 5001.
// const FLASK_BACKENDS = {
//   toor: process.env.FLASK_TOOR_URL || "http://localhost:5000", // Toor Flask on 5000
//   toorDal: process.env.FLASK_TOORDAL_URL || "http://localhost:5001", // ToorDal Flask on 5001
// };
// // **************************************************************************************

// // **************************** CHANGE 2: Add a Test Route ****************************
// // This route will be accessible via Nginx at https://grain.embel.co.in/api/test
// router.get("/test", (req, res) => {
//   res.json({ message: "Test route works from ProcessImageRoutes!" });
// });
// // ************************************************************************************

// router.post(
//   "/process-image", // This is the route path relative to where this router is mounted in server.js (i.e., /api)
//   upload.fields([
//     { name: "image1", maxCount: 1 },
//     { name: "image2", maxCount: 1 },
//     { name: "image3", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const { grain } = req.body;

//     if (!grain || !FLASK_BACKENDS[grain]) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing grain type." });
//     }

//     // **************************** CHANGE 3: Construct Flask Endpoint ****************************
//     // Make sure the full URL to the Flask endpoint is correctly formed.
//     // Assuming Flask apps also have a /process_image endpoint.
//     const flaskBaseUrl = FLASK_BACKENDS[grain];
//     const flaskEndpoint = `${flaskBaseUrl}/process_image`; // This will be e.g., http://localhost:5000/process_image
//     // ********************************************************************************************

//     const files = req.files;

//     if (!files.image1 || !files.image2 || !files.image3) {
//       return res.status(400).json({ message: "Please upload 3 images." });
//     }

//     try {
//       const formData = new FormData();
//       formData.append("grain", grain);
//       formData.append("weight", req.body.weight || ""); // Append 3 images

//       formData.append("image1", fs.createReadStream(files.image1[0].path));
//       formData.append("image2", fs.createReadStream(files.image2[0].path));
//       formData.append("image3", fs.createReadStream(files.image3[0].path));

//       const flaskResponse = await axios.post(
//         flaskEndpoint, // Use the correctly constructed full URL here
//         formData,
//         {
//           headers: formData.getHeaders(),
//           timeout: 60000,
//         }
//       ); // Clean up temp files

//       Object.values(files)
//         .flat()
//         .forEach((file) => {
//           fs.unlinkSync(file.path);
//         });

//       res.status(200).json({ results: flaskResponse.data });
//     } catch (error) {
//       console.error("Flask error:", error.message);
//       res.status(500).json({
//         message: "Image processing failed",
//         error: error.message,
//       });
//     }
//   }
// );

// export default router;

//-----------------------------------------------------

// import express from "express";
// import multer from "multer";
// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// // Mapping grain types to Flask backend URLs
// const FLASK_BACKENDS = {
//   toor: process.env.FLASK_TOOR_URL || "http://localhost:5000",
//   toorDal: process.env.FLASK_TOORDAL_URL || "http://localhost:5001",
// };

// // This route will be accessible via Nginx at https://grain.embel.co.in/api/test
// router.get("/test", (req, res) => {
//   res.json({ message: "Test route works from ProcessImageRoutes!" });
// });

// router.post(
//   "/process-image",
//   upload.fields([
//     { name: "image1", maxCount: 1 },
//     { name: "image2", maxCount: 1 },
//     { name: "image3", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     const { grain } = req.body;

//     if (!grain || !FLASK_BACKENDS[grain]) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing grain type." });
//     }

//     const flaskUrl = FLASK_BACKENDS[grain];
//     //new add
//    // const flaskBaseUrl = process.env.FLASK_BASE_URL || "http://localhost:5000";
//     //const flaskEndpoint = `${flaskBaseUrl}/process_image`; // This will be e.g., http://localhost:5000/process_image
//     //
//     const files = req.files;

//     if (!files.image1 || !files.image2 || !files.image3) {
//       return res.status(400).json({ message: "Please upload 3 images." });
//     }

//     try {
//       const formData = new FormData();
//       formData.append("grain", grain);
//       formData.append("weight", req.body.weight || "");

//       // Append 3 images
//       formData.append("image1", fs.createReadStream(files.image1[0].path));
//       formData.append("image2", fs.createReadStream(files.image2[0].path));
//       formData.append("image3", fs.createReadStream(files.image3[0].path));

//       const flaskResponse = await axios.post(
//         `${flaskUrl}/process_image`,  // flaskEndpoint, //use the correctly constructed full URL here
//         formData,
//         {
//           headers: formData.getHeaders(),
//           timeout: 60000,
//         }
//       );

//       // Clean up temp files
//       Object.values(files)
//         .flat()
//         .forEach((file) => {
//           fs.unlinkSync(file.path);
//         });

//       res.status(200).json({ results: flaskResponse.data });
//     } catch (error) {
//       console.error("Flask error:", error.message);
//       res.status(500).json({
//         message: "Image processing failed",
//         error: error.message,
//       });
//     }
//   }
// );

// export default router;
//---------------------------------------------------------------------------------
//// local serever ip  code used for testing
import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/process-image", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image1", fs.createReadStream(req.file.path));
    formData.append("image2", fs.createReadStream(req.file.path));
    formData.append("image3", fs.createReadStream(req.file.path));

    const flaskResponse = await axios.post(
      "http://192.168.1.34:5000/process-image",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    fs.unlinkSync(req.file.path);

    res.status(200).json({ results: flaskResponse.data });
  } catch (error) {
    console.error("ML Server Error:", error.message);
    res
      .status(500)
      .json({ message: "Processing Failed", error: error.message });
  }
});

export default router;
