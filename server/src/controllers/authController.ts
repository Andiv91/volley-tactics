import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(config.googleClientId);

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    let user: any = null;

    if (isPrismaAvailable && prisma) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else {
      user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas. Por favor verifique el correo y contraseña.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas. Por favor verifique el correo y contraseña.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      token,
      user: userWithoutPassword,
      message: `¡Bienvenido de nuevo, ${user.name}!`,
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor en inicio de sesión' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole: 'ADMIN' | 'USER' = role === 'ADMIN' ? 'ADMIN' : 'USER';

    // Check existing
    if (isPrismaAvailable && prisma) {
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(400).json({ message: 'Ya existe una cuenta con este correo electrónico' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          name: name.trim(),
          role: assignedRole,
          avatarUrl: '/icons/icondefault.png',
        },
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ token, user: userWithoutPassword });
    } else {
      const existing = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'Ya existe una cuenta con este correo electrónico' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const genericAvatar = '/icons/icondefault.png';
      const newUser = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        role: assignedRole,
        avatarUrl: genericAvatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.users.push(newUser);
      saveStore();

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ token, user: userWithoutPassword });
    }
  } catch (error: any) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'Error interno del servidor en registro' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential, demoUser } = req.body;

    let email = '';
    let name = '';
    let avatarUrl = '';
    let googleId = '';

    if (demoUser) {
      // 1-Click Quick Demo for Google Sign-in
      email = demoUser.email || 'atleta.google@universidad.edu';
      name = demoUser.name || 'Atleta Google Demo';
      avatarUrl = demoUser.picture || 'https://lh3.googleusercontent.com/a/ACg8ocISample';
      googleId = 'google-demo-' + Date.now();
    } else if (credential) {
      try {
        if (config.googleClientId) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config.googleClientId,
          });
          const payload = ticket.getPayload();
          if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Token de Google inválido' });
          }
          email = payload.email.toLowerCase();
          name = payload.name || 'Usuario Google';
          avatarUrl = payload.picture || '';
          googleId = payload.sub;
        } else {
          // Decode payload if client ID not configured on backend
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
          email = jsonPayload.email.toLowerCase();
          name = jsonPayload.name || 'Usuario Google';
          avatarUrl = jsonPayload.picture || '';
          googleId = jsonPayload.sub;
        }
      } catch (tokenErr) {
        console.warn('Verificación token Google fallback:', tokenErr);
        return res.status(400).json({ message: 'No se pudo verificar el token de Google' });
      }
    } else {
      return res.status(400).json({ message: 'Falta credencial de Google' });
    }

    let user: any = null;

    if (isPrismaAvailable && prisma) {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name,
            role: 'USER',
            avatarUrl: avatarUrl || '/icons/icondefault.png',
            googleId,
          },
        });
      } else if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: user.avatarUrl || avatarUrl || '/icons/icondefault.png',
          },
        });
      }
    } else {
      user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: `user-google-${Date.now()}`,
          email,
          name,
          role: 'USER',
          avatarUrl: avatarUrl || '/icons/icondefault.png',
          googleId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryDb.users.push(user);
        saveStore();
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatarUrl) user.avatarUrl = avatarUrl || '/icons/icondefault.png';
        saveStore();
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      token,
      user: userWithoutPassword,
      message: `¡Autenticación con Google exitosa, ${user.name}!`,
    });
  } catch (error: any) {
    console.error('Error en autenticación Google:', error);
    return res.status(500).json({ message: 'Error procesando autenticación con Google' });
  }
};

export const getAuthConfig = async (req: Request, res: Response) => {
  return res.json({
    googleClientId: config.googleClientId || process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    let user: any = null;
    if (isPrismaAvailable && prisma) {
      user = await prisma.user.findUnique({ where: { id: req.user.id } });
    } else {
      user = memoryDb.users.find(u => u.id === req.user?.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: 'Error obteniendo perfil de usuario' });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    const { avatarUrl } = req.body;
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return res.status(400).json({ message: 'Imagen requerida' });
    }

    // Validación de tamaño máximo 1MB (en base64 ~ 1.4MB de longitud de texto)
    if (avatarUrl.startsWith('data:image/')) {
      const stringLength = avatarUrl.length - (avatarUrl.indexOf(',') + 1);
      const sizeInBytes = (stringLength * 3) / 4;
      if (sizeInBytes > 1024 * 1024) {
        return res.status(400).json({ message: 'La imagen supera el tamaño máximo permitido de 1 MB.' });
      }
    }

    let updatedUser: any = null;
    if (isPrismaAvailable && prisma) {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl },
      });
    } else {
      const user = memoryDb.users.find(u => u.id === req.user?.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      user.avatarUrl = avatarUrl;
      user.updatedAt = new Date().toISOString();
      saveStore();
      updatedUser = user;
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json({
      message: 'Foto de perfil actualizada con éxito',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    return res.status(500).json({ message: 'Error actualizando foto de perfil' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (isPrismaAvailable && prisma) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ users });
    } else {
      const users = memoryDb.users.map(({ password: _, ...u }) => u);
      return res.json({ users });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error listando usuarios' });
  }
};
