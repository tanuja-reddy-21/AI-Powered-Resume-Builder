import express from 'express';
import { optimizeContent } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/optimize', authMiddleware, optimizeContent);

export default router;
