import prisma from "../config/database.js";
import { z } from "zod";

// Schemas de validação
const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
});

const orderSchema = z.object({
  customerName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  customerEmail: z.string().email("Email inválido").optional(),
  address: z.string().min(10, "Endereço deve ter no mínimo 10 caracteres"),
  paymentMethod: z.enum(["pix", "dinheiro", "cartao"]).optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Pedido deve ter pelo menos 1 item"),
});

const updateStatusSchema = z.object({
  status: z.enum([
    "pendente",
    "em_producao",
    "pronto",
    "entrega",
    "entregue",
    "cancelado",
  ]),
});

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    const where = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        deliveries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const validatedData = orderSchema.parse(req.body);

    // Busca produtos e calcula preço total
    const products = await prisma.product.findMany({
      where: {
        id: { in: validatedData.items.map((item) => item.productId) },
        active: true,
      },
    });

    if (products.length !== validatedData.items.length) {
      return res.status(400).json({
        success: false,
        message: "Um ou mais produtos não foram encontrados ou estão inativos",
      });
    }

    // Calcula total
    let totalPrice = 0;
    const orderItems = validatedData.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    // Cria pedido com itens
    const order = await prisma.order.create({
      data: {
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        address: validatedData.address,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Status do pedido atualizado",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        customerName: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                flavor: true,
              },
            },
          },
        },
        deliveries: {
          select: {
            status: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Pedido removido com sucesso",
    });
  } catch (error) {
    next(error);
  }
};
