import orderModel from "../models/orderModels.js";
import productModel from "../models/productModels.js";
import userModel from "../models/userModels.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "usd";
const deliveryCharge = 12;
const placeOrder = async (req, res) => {
  try {
    const { userId, amount, address, items } = req.body;

    console.log("USER ID:", userId);
    console.log("ITEMS:", items);
    console.log("AMOUNT:", amount);

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!items || items.length === 0) {
      return res.json({
        success: false,
        message: "Order is empty",
      });
    }

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await productModel.findById(item._id);

        if (!product) {
          throw new Error(`Product not found: ${item._id}`);
        }

        return {
          itemId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        };
      }),
    );

    const orderData = {
      userId,
      items: orderItems,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      status: "Order placed",
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);

    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, {
      cartData: {},
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log("🔥 PLACE ORDER BACKEND ERROR:");
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    const { userId, amount, address } = req.body;
    const { origin } = req.headers;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    const items = await Promise.all(
      Object.entries(userData.cartData).map(async ([itemId, quantity]) => {
        const product = await productModel.findById(itemId);

        return {
          itemId,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        };
      }),
    );

    if (items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);

    await newOrder.save();

    line_items.push({
      price_data: {
        currency: currency,
        product_data: { name: "Delivery charge" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
  }
};
const allOrder = async (req, res) => {
  try {
    const order = await orderModel.find({});
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not fetch orders" });
  }
};

const userOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not fetch orders" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });

    res.json({ success: true, message: "Orders status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { placeOrder, placeOrderStripe, allOrder, userOrder, updateStatus };
