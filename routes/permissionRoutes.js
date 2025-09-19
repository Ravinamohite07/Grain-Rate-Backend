import express from "express";
import { requestPermission, approvePermission, getAllPermissions} from "../controllers/permission.controller.js";
import { protect } from "../middleware/authorization.js";
const router = express.Router();

router.post("/request", protect, requestPermission); // POST /permissions/request
router.patch("/approve/:requestId", protect, approvePermission); // PATCH /permissions/approve/:requestId
router.get("/", protect, getAllPermissions); 

export default router;
