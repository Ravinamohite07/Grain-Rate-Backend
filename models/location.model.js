// models/location.model.js

import mongoose from 'mongoose';

// Note: We don't need a separate model for these,
// they will be sub-documents within the StateSchema.
const talukaSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const districtSchema = new mongoose.Schema({
  district: { type: String, required: true },
  talukas: [{ type: String }] // An array of strings is simple and efficient here
});

const stateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  districts: [districtSchema] // An array of district sub-documents
});

// Create the model
const Location = mongoose.models.Location || mongoose.model('Location', stateSchema);

export default Location;