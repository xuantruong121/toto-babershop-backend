import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, forgotPassword, resetPassword, getUsers, createUser } from '../controllers/authController.js';

const router = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau 10 phút' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Quá nhiều lần đăng nhập sai, vui lòng thử lại sau 15 phút' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/register', register);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/users', getUsers);
router.post('/users', createUser);

export default router;
