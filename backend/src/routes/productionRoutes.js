import express from 'express';
import {
  getAllProductions,
  getProductionById,
  createProduction,
  updateProductionStatus,
  deleteProduction,
} from '../controllers/productionController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas protegidas (admin ou produção)
router.get('/', authenticate, authorize('admin', 'producao'), getAllProductions);
router.get('/:id', authenticate, authorize('admin', 'producao'), getProductionById);
router.post('/', authenticate, authorize('admin', 'producao'), createProduction);
router.put('/:id/status', authenticate, authorize('admin', 'producao'), updateProductionStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteProduction);

export default router;