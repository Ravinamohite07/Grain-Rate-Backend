import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Product count where user created the product
    const productCount = await Product.countDocuments({ createdBy: userId });

    // Find cart by userId
    const cart = await Cart.findOne({ userId });

    let cartCount = 0;
    let totalQuantity = 0;

    if (cart) {
      cartCount = cart.items.length;
      totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    res.json({
      productCount,
      cartCount,
      totalQuantity,
    });
  } catch (error) {
    console.error("Error in dashboard-data:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching dashboard data" });
  }
};
