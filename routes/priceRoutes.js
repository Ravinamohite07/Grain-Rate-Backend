import express from 'express';
import cors from 'cors'; // Import CORS
import {
  fetchPricesByUserType,
  addPrice,
  uploadPrices,
  //getProductsByUserType,
  //getProductsByRegionAndUserType,
  downloadPriceTemplate,
  approvePrice,
  rejectPrice,
  fetchPendingPrices
} from '../controllers/price.controller.js';
import multer from 'multer';
import { authorizeRoles, protect } from "../middleware/authorization.js"; 
//  import { getMyProducts } from '../controllers/product.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for all routes
router.use(cors({
  origin: '*', // Adjust this to your frontend URL in production
  credentials: true,
}));

router.get('/', fetchPricesByUserType);
router.post('/add', protect, addPrice); // Price addition (super-user/admin)
//router.get('/by-usertype', authorizeRoles, getProductsByUserType);
//router.get('/myproducts', getMyProducts);
router.post('/upload-prices',protect, upload.single('file'), uploadPrices);
router.get('/download-template', downloadPriceTemplate);
//router.get('/by-usertype', getProductsByUserType);
//router.get('/by-region-usertype', protect, getProductsByRegionAndUserType);

// Admin actions
router.get('/pending', fetchPendingPrices);  // Fetch pending prices for admin
router.patch('/approve/:priceId', approvePrice); // Approve a price
router.patch('/reject/:priceId', rejectPrice);  // Reject a price

export default router;
