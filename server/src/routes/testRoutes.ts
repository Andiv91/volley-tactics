import { Router } from 'express';
import { getTests, getTestById, createTest, deleteTest } from '../controllers/testController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getTests);
router.get('/:id', authenticateJwt, getTestById);
router.post('/', authenticateJwt, requireAdmin, createTest);
router.delete('/:id', authenticateJwt, requireAdmin, deleteTest);

export default router;
