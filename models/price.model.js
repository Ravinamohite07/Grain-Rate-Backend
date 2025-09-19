import mongoose from 'mongoose';

// Price Schema
const priceSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'distributor', 'retailer', 'trader','admin'],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  region: {  // Added region to price schema
    type: {
      state: String,
      district: String,
      taluka: String,
    },
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Price = mongoose.model('Price', priceSchema);

export default Price;

