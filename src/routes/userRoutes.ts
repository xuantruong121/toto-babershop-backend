import express from 'express';
import { getProfile, updateProfile, addAddress, deleteAddress, setDefaultAddress } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/addresses', authenticateToken, addAddress);
router.delete('/addresses/:id', authenticateToken, deleteAddress);
router.put('/addresses/:id/default', authenticateToken, setDefaultAddress);

export default router;
