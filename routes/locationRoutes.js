//routes/location.routes.js (UPDATED)

import express from 'express';
import Location from '../models/location.model.js'; // Import the Mongoose model

const router = express.Router();

/**
 * @route   GET /api/locations/states
 * @desc    Get all states from MongoDB
 * @access  Public
 */
router.get("/states", async (req, res) => {
  try {
    // Find all documents, but only return the 'state' field, and exclude the '_id' field
    const states = await Location.find({}).select('state -_id');
    // The result is an array of objects like [{state: '...'}], so we map it to an array of strings
    const stateNames = states.map(s => s.state);
    res.json(stateNames);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   GET /api/locations/districts/:stateName
 * @desc    Get all districts for a given state from MongoDB
 * @access  Public
 */
router.get("/districts/:stateName", async (req, res) => {
  try {
    const { stateName } = req.params;
    
    // Find the state document. We use a case-insensitive regex for flexibility.
    const state = await Location.findOne({ state: { $regex: new RegExp(`^${stateName}$`, 'i') } });

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    
    // Extract just the names of the districts from the sub-documents
    const districtNames = state.districts.map(d => d.district);
    res.json(districtNames);

  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).send("Server Error");
  }
});

/**
 * @route   GET /api/locations/talukas/:stateName/:districtName
 * @desc    Get all talukas for a given district from MongoDB
 * @access  Public
 */
router.get("/talukas/:stateName/:districtName", async (req, res) => {
  try {
    const { stateName, districtName } = req.params;

    // Find the state document
    const state = await Location.findOne({ state: { $regex: new RegExp(`^${stateName}$`, 'i') } });
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    // Find the specific district within the 'districts' array of the found state
    const district = state.districts.find(
      d => d.district.toLowerCase() === districtName.toLowerCase()
    );
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }

    res.json(district.talukas || []); // Send the talukas array

  } catch (error) {
    console.error("Error fetching talukas:", error);
    res.status(500).send("Server Error");
  }
});

export default router;