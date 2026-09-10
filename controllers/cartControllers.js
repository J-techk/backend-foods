import userModel from "../models/userModels.js";

// function to add product to user cart

const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }

    let cartData = userData.cartData;

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    console.log("userId:", userId);
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }
    let cartData = await userData.cartData;
    cartData[itemId] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };
