import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ============================================================================
// Storage Configuration
// Currently: Local disk storage under /uploads
// To migrate to Cloudflare R2 / Backblaze B2:
//   1. Replace DiskStorage with a cloud SDK (e.g. @aws-sdk/client-s3 for R2)
//   2. Update the `uploadFile` handler to push to the bucket instead of disk
//   3. Return the CDN URL instead of a local path
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF, AVIF).'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Không có file được gửi lên.' });
    }

    // Build public URL
    // In production with cloud storage: return the CDN URL here
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const url = `${baseUrl}/uploads/${file.filename}`;

    res.json({
      success: true,
      url,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi khi tải file lên.' });
  }
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Không có file được gửi lên.' });
    }

    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const urls = files.map(file => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));

    res.json({ success: true, files: urls });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: 'Lỗi khi tải file lên.' });
  }
};
