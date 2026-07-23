import type { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

// ============================================================================
// Storage Configuration
// Tự động chuyển sang Cloudflare R2 nếu có đủ biến môi trường.
// Ngược lại, fallback về Local Disk.
// ============================================================================

const useR2 = Boolean(
  process.env.R2_ACCOUNT_ID && 
  process.env.R2_ACCESS_KEY_ID && 
  process.env.R2_SECRET_ACCESS_KEY && 
  process.env.R2_BUCKET_NAME
);

let storage: multer.StorageEngine;

if (useR2) {
  console.log('📦 Bật chế độ Upload lên Cloudflare R2');
  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.R2_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${unique}${ext}`); // Save to root of bucket
    },
  });
} else {
  console.log('💾 Bật chế độ Upload Local (DiskStorage)');
  const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${unique}${ext}`);
    },
  });
}

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

const getFileUrl = (file: Express.Multer.File): string => {
  if (useR2 && process.env.R2_PUBLIC_URL) {
    // S3/R2 multer trả về location hoặc key tùy cấu hình, multer-s3 gán key vào file.key
    const key = (file as any).key || file.filename;
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  
  const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${file.filename}`;
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Không có file được gửi lên.' });
    }

    const url = getFileUrl(file);

    res.json({
      success: true,
      url,
      filename: (file as any).key || file.filename,
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

    const urls = files.map(file => ({
      url: getFileUrl(file),
      filename: (file as any).key || file.filename,
      size: file.size,
    }));

    res.json({ success: true, files: urls });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(500).json({ error: 'Lỗi khi tải file lên.' });
  }
};
