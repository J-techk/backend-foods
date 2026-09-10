import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

import {
  placeOrder,
  placeOrderStripe,
  allOrder,
  userOrder,
  updateStatus,
} from "../controllers/orderControllers.js";

const orderRouter = express.Router();

// route for admin panel
orderRouter.post("/list", adminAuth, allOrder);
orderRouter.post("/status", adminAuth, updateStatus);

// route for placing order through stripe
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);

// route for placing order from the frontend
orderRouter.post("/userorders", authUser, userOrder);

export default orderRouter;
