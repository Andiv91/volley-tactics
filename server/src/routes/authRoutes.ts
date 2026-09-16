import { Router } from 'express';
import { login, register, googleAuth, getMe, getAllUsers, updateAvatar } from '../controllers/authController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/me', authenticateJwt, getMe);
router.post('/avatar', authenticateJwt, updateAvatar);
router.get('/users', authenticateJwt, requireAdmin, getAllUsers);

export default router;
