import { Router } from 'express';
import {
  login,
  register,
  googleAuth,
  getMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateAvatar,
  getAuthConfig,
} from '../controllers/authController';
import { authenticateJwt, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/config', getAuthConfig);
router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/me', authenticateJwt, getMe);
router.post('/avatar', authenticateJwt, updateAvatar);

// Gestión de Usuarios (acceso para Administrador y Técnicos autorizados)
router.get('/users', authenticateJwt, requireAdmin, getAllUsers);
router.post('/users', authenticateJwt, requireAdmin, createUser);
router.put('/users/:id', authenticateJwt, requireAdmin, updateUser);
router.delete('/users/:id', authenticateJwt, requireAdmin, deleteUser);

export default router;
