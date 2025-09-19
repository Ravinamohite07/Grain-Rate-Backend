import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  packagingSize: {
    type: Number,
    required: true
  },
  unitType: {
    type: String,
    required: true
  },
  grainImage: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // createdFor: {
  //   type: [String],
  //   required: true,
  //   enum: ['farmer', 'distributor', 'retailer', 'trader']
  // },
  createdFor: [{
  type: String,
  enum: ['farmer', 'distributor', 'retailer', 'trader'],
  required: true
}],

  prices: [{ // Add this field to create a relationship with the Price model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Price' // Assuming your Price model is named 'Price'
  }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;