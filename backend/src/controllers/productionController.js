import prisma from "../config/database.js";
import { z } from "zod";

const productionSchema = z.object({
  productId: z.number().int().positive(),
  yieldAmount: z
    .number()
    .int()
    .positive("Quantidade produzida deve ser positiva"),
  batchCode: z.string().optional(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["preparando", "no_fogo", "resfriando", "pronto"]),
});

export const getAllProductions = async (req, res, next) => {
  try {
    const { status, productId, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (productId) where.productId = parseInt(productId);
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(startDate);
      if (endDate) where.startedAt.lte = new Date(endDate);
    }

    const productions = await prisma.production.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: { startedAt: "desc" },
    });

    res.json({
      success: true,
      data: productions,
      total: productions.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const production = await prisma.production.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: true,
      },
    });

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Produção não encontrada",
      });
    }

    res.json({
      success: true,
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduction = async (req, res, next) => {
  try {
    const validatedData = productionSchema.parse(req.body);

    // Verifica se produto existe
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    const production = await prisma.production.create({
      data: validatedData,
      include: {
        product: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Produção iniciada com sucesso",
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const updateData = { status };

    // Se status for 'pronto', marca finishedAt
    if (status === "pronto") {
      updateData.finishedAt = new Date();
    }

    const production = await prisma.production.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        product: true,
      },
    });

    res.json({
      success: true,
      message: "Status da produção atualizado",
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduction = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.production.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Produção removida com sucesso",
    });
  } catch (error) {
    next(error);
  }
};
