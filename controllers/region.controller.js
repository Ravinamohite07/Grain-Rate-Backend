// import Region from '../models/region.model.js';

// // Function to create a new region
// export const createRegion = async (req, res) => {
//   const { state, district, taluka } = req.body;

//   // Check if region already exists
//   const existingRegion = await Region.findOne({ state, district, taluka });
//   if (existingRegion) {
//     return res.status(400).json({ message: 'Region already exists' });
//   }

//   // Create new region
//   const region = new Region({
//     state,
//     district,
//     taluka,
//   });

//   try {
//     const savedRegion = await region.save();
//     res.status(201).json(savedRegion);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating region', error });
//   }
// };

// // Function to get all regions
// export const getAllRegions = async (req, res) => {
//   try {
//     const regions = await Region.find();
//     res.status(200).json(regions);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching regions', error });
//   }
// };

// // Function to find a region by state, district, and taluka
// export const getRegionByDetails = async (req, res) => {
//   const { state, district, taluka } = req.params;

//   try {
//     const region = await Region.findOne({ state, district, taluka });
//     if (!region) {
//       return res.status(404).json({ message: 'Region not found' });
//     }
//     res.status(200).json(region);
//   } catch (error) {s
//     res.status(500).json({ message: 'Error fetching region', error });
//   }
// };
