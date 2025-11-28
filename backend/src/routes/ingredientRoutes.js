import express from "express";
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  adjustIngredientStock,
  deleteIngredient,
} from "../controllers/ingredientController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Todas as rotas protegidas (admin ou produção)
router.get(
  "/",
  authenticate,
  authorize("admin", "producao"),
  getAllIngredients
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "producao"),
  getIngredientById
);
router.post("/", authenticate, authorize("admin"), createIngredient);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "producao"),
  updateIngredient
);
router.patch(
  "/:id/adjust",
  authenticate,
  authorize("admin", "producao"),
  adjustIngredientStock
);
router.delete("/:id", authenticate, authorize("admin"), deleteIngredient);

export default router;
