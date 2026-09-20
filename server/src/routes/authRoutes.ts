import { Router } from 'express';
import { login, register, googleAuth, getMe, getAllUsers, updateAvatar, getAuthConfig } from '../controllers/authController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/config', getAuthConfig);
router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/me', authenticateJwt, getMe);
router.post('/avatar', authenticateJwt, updateAvatar);
router.get('/users', authenticateJwt, requireAdmin, getAllUsers);

export default router;
