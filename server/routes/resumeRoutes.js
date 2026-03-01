import express from 'express';
import { createResume, getResumes, getResume, updateResume, deleteResume, duplicateResume, matchJobDescription } from '../controllers/resumeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createResume);
router.get('/', authMiddleware, getResumes);
router.get('/:id', getResume);
router.put('/:id', authMiddleware, updateResume);
router.delete('/:id', authMiddleware, deleteResume);
router.post('/:id/duplicate', authMiddleware, duplicateResume);
router.post('/match-jd', authMiddleware, matchJobDescription);

export default router;
