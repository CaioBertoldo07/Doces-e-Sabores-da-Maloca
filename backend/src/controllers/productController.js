import prisma from "../config/database.js";
import { z } from "zod";

// Schema de validação
const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  imageUrl: z.string().url("URL inválida").optional(),
  category: z.string().default("cocada"),
  flavor: z.string().optional(),
  active: z.boolean().default(true),
});

export const getAllProducts = async (req, res, next) => {
  try {
    const { active, category, flavor } = req.query;

    const where = {};
    if (active !== undefined) where.active = active === "true";
    if (category) where.category = category;
    if (flavor) where.flavor = flavor;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validatedData = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Produto criado com sucesso",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: validatedData,
    });

    res.json({
      success: true,
      message: "Produto atualizado com sucesso",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete - apenas desativa o produto
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: false },
    });

    res.json({
      success: true,
      message: "Produto desativado com sucesso",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const hardDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Produto removido permanentemente",
    });
  } catch (error) {
    next(error);
  }
};
