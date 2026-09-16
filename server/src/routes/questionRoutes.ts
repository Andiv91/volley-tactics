import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getQuestions);
router.get('/:id', authenticateJwt, getQuestionById);
router.post('/', authenticateJwt, requireAdmin, createQuestion);
router.delete('/:id', authenticateJwt, requireAdmin, deleteQuestion);

export default router;
