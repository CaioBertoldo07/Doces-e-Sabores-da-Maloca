import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} from "../controllers/productController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Rotas públicas
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Rotas protegidas (apenas admin)
router.post("/", authenticate, authorize("admin"), createProduct);
router.put("/:id", authenticate, authorize("admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);
router.delete("/:id/hard", authenticate, authorize("admin"), hardDeleteProduct);

export default router;
