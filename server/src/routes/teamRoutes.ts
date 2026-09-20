import { Router } from 'express';
import { getTeams, createTeam, deleteTeam, joinTeam, getMyTeam } from '../controllers/teamController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

// Public / Authenticated user routes
router.get('/', authenticateJwt, getTeams);
router.get('/my-team', authenticateJwt, getMyTeam);
router.post('/join', authenticateJwt, joinTeam);

// Admin only routes
router.post('/', authenticateJwt, requireAdmin, createTeam);
router.delete('/:id', authenticateJwt, requireAdmin, deleteTeam);

export default router;
