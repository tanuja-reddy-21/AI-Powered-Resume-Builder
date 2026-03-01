import express from 'express';
import multer from 'multer';
import { uploadImage, getAuthParams } from '../controllers/imageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('image'), uploadImage);
router.get('/auth', authMiddleware, getAuthParams);

export default router;
