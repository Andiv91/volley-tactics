import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJwt, getAnalytics);

export default router;
