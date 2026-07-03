import express from 'express';
import multer from 'multer';
import { extractPdfText } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer memory storage (limit files to 15MB for stability)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// POST /api/upload-pdf
router.post('/', upload.single('pdf'), extractPdfText);

export default router;
