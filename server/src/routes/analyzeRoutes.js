import express from 'express';
import { analyzeText } from '../controllers/analyzeController.js';

const router = express.Router();

// POST /api/analyze
router.post('/', analyzeText);

export default router;
