import { Router } from 'express';
import { getProducts, searchProducts, createProduct } from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.post('/', authenticateToken, requireAdmin, createProduct);

export default router;
