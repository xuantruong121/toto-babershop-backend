import { Router } from 'express';
import { getOrders, createOrder, paymentWebhook } from '../controllers/orderController.js';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', getOrders);
router.post('/checkout', authenticateToken, checkoutLimiter, createOrder);
router.post('/webhook/payment', paymentWebhook);

export default router;
