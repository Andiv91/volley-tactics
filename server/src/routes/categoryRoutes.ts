import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateJwt, requireAdmin, createCategory);

export default router;
