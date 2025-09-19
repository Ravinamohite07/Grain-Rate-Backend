import { PermissionRequest } from "../models/permission.model.js";

export const requestPermission = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if a pending request already exists
    const existing = await PermissionRequest.findOne({
      userId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "A permission request is already pending." });
    }

    const newRequest = new PermissionRequest({ userId });
    await newRequest.save();

    return res.status(201).json({ message: "Permission request sent to admin." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

export const getAllPermissions = async (req, res) => {
    try {
      const requests = await PermissionRequest.find().populate("userId", "name email"); // Optional: populate user details
      res.status(200).json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while fetching permission requests." });
    }
  };
  

export const approvePermission = async (req, res) => {
    try {
      const { requestId } = req.params;
      const adminId = req.user._id;
  
      const request = await PermissionRequest.findById(requestId);
      if (!request) return res.status(404).json({ message: "Request not found." });
  
      request.status = "approved";
      request.approvedAt = new Date();
      request.approvedBy = adminId;
      await request.save();
  
      res.status(200).json({ message: "Permission request approved." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error." });
    }
  };
  