import { Router } from 'express';
import {
  getTeams,
  createTeam,
  deleteTeam,
  joinTeam,
  getMyTeam,
  addStudentToTeam,
  removeStudentFromTeam,
  getAvailableStudents,
} from '../controllers/teamController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

// Public / Authenticated user routes
router.get('/', authenticateJwt, getTeams);
router.get('/my-team', authenticateJwt, getMyTeam);
router.post('/join', authenticateJwt, joinTeam);

// Admin / Coach routes for team & student management
router.get('/students/available', authenticateJwt, requireAdmin, getAvailableStudents);
router.post('/', authenticateJwt, requireAdmin, createTeam);
router.post('/:id/members', authenticateJwt, requireAdmin, addStudentToTeam);
router.delete('/:id/members/:studentId', authenticateJwt, requireAdmin, removeStudentFromTeam);
router.delete('/:id', authenticateJwt, requireAdmin, deleteTeam);

export default router;
