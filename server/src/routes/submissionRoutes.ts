import { Router } from 'express';
import { submitTest, getSubmissions, getSubmissionById } from '../controllers/submissionController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJwt, submitTest);
router.get('/', authenticateJwt, getSubmissions);
router.get('/:id', authenticateJwt, getSubmissionById);

export default router;
