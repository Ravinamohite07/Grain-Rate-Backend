

// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   phoneNo: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   aadharCard: { type: String, required: true },
//   panCard: { type: String, required: true },
//   business: { type: String, required: true },
//   address: { type: String, required: true },
//   state: { type: String, required: true },
//   district: { type: String, required: true },
//   taluka: { type: String, required: true },
//   role: {
//     type: String,
//     required: true,
//     enum: ['superadmin','admin', 'user', 'trader', 'distributor', 'retailer', 'farmer', 'super-user'],
//   },
//   status: { type: String, default: 'accepted' },
// });

// // Change named export to default export ✅
// const User = mongoose.models.User || mongoose.model('User', userSchema);
// export default User;

// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   password: { type: String, required: true },
//   phoneNo: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   role: {
//     type: String,
//     required: true,
//     enum: ['superadmin', 'admin', 'user', 'trader', 'distributor', 'retailer', 'farmer', 'super-user'], 
//   },
//   status: { type: String, default: 'accepted' },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

//   // Additional fields, but they won't be required at the schema level
//   firstName: { type: String },
//   lastName: { type: String },
//   aadharCard: { type: String },
//   panCard: { type: String },
//   business: { type: String },
//   address: { type: String },
//   state: { type: String },
//   district: { type: String },
//   taluka: { type: String },
// });

// // ** Middleware to Remove Unnecessary Validations for Admins **
// userSchema.pre('validate', function (next) {
//   if (this.role === 'admin' || this.role === 'superadmin') {
//     this.firstName = undefined;
//     this.lastName = undefined;
//     this.aadharCard = undefined;
//     this.panCard = undefined;
//     this.business = undefined;
//     this.address = undefined;
//     this.state = undefined;
//     this.district = undefined;
//     this.taluka = undefined;
//   }
//   next();
// });

// // Static method to enforce role-based creation
// userSchema.statics.canCreateUser = function (creatorRole, newUserRole) {
//   const rolePermissions = {
//     superadmin: ['admin'], // <- ✅ Add this
//     admin: ['farmer', 'distributor', 'trader', 'retailer', 'customer'],
//     trader: ['distributor', 'retailer'],
//     distributor: ['retailer'],
//     // add more roles if needed
//   };

//   return rolePermissions[creatorRole]?.includes(newUserRole) || false;
// };


// // Export model
// const User = mongoose.models.User || mongoose.model('User', userSchema);
// export default User;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ['superadmin', 'admin', 'user', 'trader', 'distributor', 'retailer', 'farmer', 'super-user'], 
  },
  status: { type: String, default: 'accepted' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profileImageUrl: {
    type: String,
    default: '', // Will store the public URL like http://.../logo.png
  },
  logoText: {
    type: String,
    default: 'Default Company Name', // A fallback default name
  },

  // Additional optional fields
  firstName: { type: String },
  lastName: { type: String },
  aadharCard: { type: String },
  panCard: { type: String },
  business: { type: String },
  address: { type: String },
  state: { type: String },
  district: { type: String },
  taluka: { type: String },
  pincode: { type: String },
  gstNo: { type: String },
  alternativeMobileNo: { type: String },
  country: { type: String },
});

// ** Middleware to Remove Unnecessary Validations for Admins **
userSchema.pre('validate', function (next) {
  if (this.role === 'admin' || this.role === 'superadmin') {
    this.firstName = undefined;
    this.lastName = undefined;
    this.aadharCard = undefined;
    this.panCard = undefined;
    this.business = undefined;
    this.address = undefined;
    this.state = undefined;
    this.district = undefined;
    this.taluka = undefined;
    this.pincode = undefined;
    this.gstNo = undefined;
    this.alternativeMobileNo = undefined;
    this.country = undefined;
  }
  next();
});

// Static method to enforce role-based creation
userSchema.statics.canCreateUser = function (creatorRole, newUserRole) {
  const rolePermissions = {
    superadmin: ['admin'],
    admin: ['farmer', 'distributor', 'trader', 'retailer', 'customer'],
    trader: ['distributor', 'retailer'],
    distributor: ['retailer'],
  };

  return rolePermissions[creatorRole]?.includes(newUserRole) || false;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

///////////////////////01-10-2024//////////////////
