import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  trackOrder,
  deleteOrder,
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rota pública para criar pedido
router.post('/', createOrder);

// Rota pública para rastreamento
router.get('/:id/track', trackOrder);

// Rotas protegidas
router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'producao'), updateOrderStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

export default router;