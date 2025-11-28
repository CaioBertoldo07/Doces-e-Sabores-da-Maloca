import prisma from "../config/database.js";
import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unit: z.string().default("kg"),
  minStock: z.number().positive("Estoque mínimo deve ser positivo").default(5),
});

export const getAllIngredients = async (req, res, next) => {
  try {
    const { lowStock } = req.query;

    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });

    // Filtrar ingredientes com estoque baixo se solicitado
    let filteredIngredients = ingredients;
    if (lowStock === "true") {
      filteredIngredients = ingredients.filter(
        (ing) => ing.quantity <= ing.minStock
      );
    }

    res.json({
      success: true,
      data: filteredIngredients,
      total: filteredIngredients.length,
      alerts: ingredients.filter((ing) => ing.quantity <= ing.minStock).length,
    });
  } catch (error) {
    next(error);
  }
};

export const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingrediente não encontrado",
      });
    }

    res.json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const createIngredient = async (req, res, next) => {
  try {
    const validatedData = ingredientSchema.parse(req.body);

    const ingredient = await prisma.ingredient.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Ingrediente adicionado com sucesso",
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = ingredientSchema.partial().parse(req.body);

    const ingredient = await prisma.ingredient.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    res.json({
      success: true,
      message: "Ingrediente atualizado com sucesso",
      data: ingredient,
    });
  } catch (error) {
    next(error);
  }
};

export const adjustIngredientStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = z
      .object({
        quantity: z.number(),
        operation: z.enum(["add", "subtract"]),
      })
      .parse(req.body);

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingrediente não encontrado",
      });
    }

    const newQuantity =
      operation === "add"
        ? ingredient.quantity + quantity
        : ingredient.quantity - quantity;

    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantidade insuficiente em estoque",
      });
    }

    const updatedIngredient = await prisma.ingredient.update({
      where: { id: parseInt(id) },
      data: { quantity: newQuantity },
    });

    res.json({
      success: true,
      message: "Estoque ajustado com sucesso",
      data: updatedIngredient,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.ingredient.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Ingrediente removido com sucesso",
    });
  } catch (error) {
    next(error);
  }
};
