import express from "express";
import {
  addProduct,
  listProduct,
  singleProduct,
  removeProduct,
} from "../controllers/productControllers.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post("/add", upload.single("image"), adminAuth, addProduct);
productRouter.get("/list", listProduct);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.get("/single", singleProduct);

export default productRouter;
