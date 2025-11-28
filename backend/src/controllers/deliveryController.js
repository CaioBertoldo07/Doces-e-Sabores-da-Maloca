import prisma from "../config/database.js";
import { z } from "zod";

const deliverySchema = z.object({
  orderId: z.number().int().positive(),
  deliveryMan: z.number().int().positive(),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pendente", "a_caminho", "entregue", "cancelado"]),
});

export const getAllDeliveries = async (req, res, next) => {
  try {
    const { status, deliveryMan, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (deliveryMan) where.deliveryMan = parseInt(deliveryMan);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: deliveries,
      total: deliveries.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Entrega não encontrada",
      });
    }

    res.json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const createDelivery = async (req, res, next) => {
  try {
    const validatedData = deliverySchema.parse(req.body);

    // Verifica se pedido existe
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado",
      });
    }

    // Verifica se entregador existe
    const deliveryMan = await prisma.user.findUnique({
      where: { id: validatedData.deliveryMan },
    });

    if (!deliveryMan || deliveryMan.role !== "entrega") {
      return res.status(400).json({
        success: false,
        message: "Entregador inválido",
      });
    }

    const delivery = await prisma.delivery.create({
      data: validatedData,
      include: {
        order: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Atualiza status do pedido
    await prisma.order.update({
      where: { id: validatedData.orderId },
      data: { status: "entrega" },
    });

    res.status(201).json({
      success: true,
      message: "Entrega criada com sucesso",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const delivery = await prisma.delivery.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Se entrega foi concluída, atualiza pedido
    if (status === "entregue") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: "entregue" },
      });
    }

    res.json({
      success: true,
      message: "Status da entrega atualizado",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.delivery.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Entrega removida com sucesso",
    });
  } catch (error) {
    next(error);
  }
};
