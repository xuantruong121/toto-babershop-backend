import { Router } from 'express';
import { upload, uploadFile, uploadMultipleFiles } from '../controllers/uploadController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Upload single image
router.post('/image', authenticateToken, upload.single('image'), uploadFile);

// Upload multiple images (up to 10)
router.post('/images', authenticateToken, upload.array('images', 10), uploadMultipleFiles);

export default router;
