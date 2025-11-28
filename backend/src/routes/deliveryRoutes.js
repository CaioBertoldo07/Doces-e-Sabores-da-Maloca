import express from "express";
import {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
  deleteDelivery,
} from "../controllers/deliveryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas protegidas
router.get("/", authenticate, authorize("admin", "entrega"), getAllDeliveries);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "entrega"),
  getDeliveryById
);
router.post("/", authenticate, authorize("admin"), createDelivery);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "entrega"),
  updateDeliveryStatus
);
router.delete("/:id", authenticate, authorize("admin"), deleteDelivery);

export default router;
