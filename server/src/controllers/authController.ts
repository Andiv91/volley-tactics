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
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const cleanInput = email.trim();
    let user: any = null;

    if (isPrismaAvailable && prisma) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: cleanInput, mode: 'insensitive' } },
            { email: { equals: `${cleanInput.toLowerCase()}@volleyball.edu`, mode: 'insensitive' } },
            { name: { equals: cleanInput, mode: 'insensitive' } },
          ],
        },
        include: { team: true },
      });
    } else {
      const lower = cleanInput.toLowerCase();
      const rawUser = memoryDb.users.find(
        u =>
          u.email.toLowerCase() === lower ||
          u.email.toLowerCase() === `${lower}@volleyball.edu` ||
          u.name.toLowerCase() === lower
      );
      if (rawUser) {
        const team = (memoryDb.teams || []).find(t => t.id === rawUser.teamId);
        user = { ...rawUser, team: team || null };
      }
    }

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas. Por favor verifique el usuario y la contraseña.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas. Por favor verifique el usuario y la contraseña.' });
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
    // Asignación explícita de rol: COACH (Técnico) o USER (Estudiante)
    const assignedRole = role === 'ADMIN' || role === 'COACH' || role === 'TECNICO' ? 'COACH' : 'USER';

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
    const { credential, demoUser, mode, role } = req.body;

    let email = '';
    let name = '';
    let avatarUrl = '';
    let googleId = '';

    if (demoUser) {
      email = demoUser.email || 'atleta.google@universidad.edu';
      name = demoUser.name || 'Atleta Google Demo';
      avatarUrl = demoUser.picture || '/icons/icondefault.png';
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
        try {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
          if (jsonPayload && jsonPayload.email) {
            email = jsonPayload.email.toLowerCase();
            name = jsonPayload.name || 'Usuario Google';
            avatarUrl = jsonPayload.picture || '';
            googleId = jsonPayload.sub;
          } else {
            return res.status(400).json({ message: 'No se pudo verificar el token de Google' });
          }
        } catch {
          return res.status(400).json({ message: 'No se pudo verificar el token de Google' });
        }
      }
    } else {
      return res.status(400).json({ message: 'Falta credencial de Google' });
    }

    let user: any = null;

    if (isPrismaAvailable && prisma) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { team: true },
      });
    } else {
      const raw = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (raw) {
        const team = (memoryDb.teams || []).find(t => t.id === raw.teamId);
        user = { ...raw, team: team || null };
      }
    }

    // 1. Si viene en modo LOGIN (o sin especificar modo de registro) y el usuario NO existe:
    if (!user && mode !== 'register') {
      return res.json({
        notRegistered: true,
        googleProfile: {
          email,
          name,
          avatarUrl,
          googleId,
          credential,
        },
        message: `No se encontró ninguna cuenta registrada en Volleyball Tactics asociada a "${email}".`,
      });
    }

    // 2. Si viene en modo REGISTRO y el usuario ya existe:
    if (mode === 'register' && user) {
      return res.status(400).json({
        message: 'Ya existe una cuenta con este correo de Google. Por favor inicia sesión.',
      });
    }

    // 3. Crear usuario (modo registro con Google):
    if (!user) {
      const assignedRole = role === 'ADMIN' || role === 'COACH' || role === 'TECNICO' ? 'COACH' : 'USER';
      if (isPrismaAvailable && prisma) {
        user = await prisma.user.create({
          data: {
            email,
            name: (req.body.name || name).trim(),
            role: assignedRole,
            avatarUrl: avatarUrl || '/icons/icondefault.png',
            googleId,
          },
          include: { team: true },
        });
      } else {
        user = {
          id: `user-google-${Date.now()}`,
          email,
          name: (req.body.name || name).trim(),
          role: assignedRole,
          avatarUrl: avatarUrl || '/icons/icondefault.png',
          googleId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          team: null,
        };
        memoryDb.users.push(user);
        saveStore();
      }
    } else if (!user.googleId) {
      // Vincular googleId si la cuenta ya existía
      if (isPrismaAvailable && prisma) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: user.avatarUrl || avatarUrl || '/icons/icondefault.png',
          },
          include: { team: true },
        });
      } else {
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
      message: `¡Bienvenido, ${user.name}!`,
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
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          team: {
            include: {
              createdBy: { select: { id: true, name: true, email: true } },
              members: {
                select: { id: true, name: true, email: true, avatarUrl: true, role: true },
              },
            },
          },
          teamMemberships: {
            include: {
              team: {
                include: {
                  createdBy: { select: { id: true, name: true, email: true } },
                  members: {
                    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
                  },
                },
              },
            },
          },
        },
      });

      if (user && !user.team && user.teamMemberships && user.teamMemberships.length > 0) {
        user.team = user.teamMemberships[0].team;
        user.teamId = user.team.id;
      }
    } else {
      const raw = memoryDb.users.find(u => u.id === req.user?.id);
      if (raw) {
        let teamId = raw.teamId;
        if (!teamId) {
          const tm = (memoryDb.teamMembers || []).find(tm => tm.userId === raw.id);
          if (tm) teamId = tm.teamId;
        }
        const team = (memoryDb.teams || []).find(t => t.id === teamId);
        const members = team
          ? (memoryDb.users || [])
              .filter(u => u.teamId === team.id || (memoryDb.teamMembers || []).some(tm => tm.teamId === team.id && tm.userId === u.id))
              .map(({ password: _, ...u }) => u)
          : [];
        user = {
          ...raw,
          teamId,
          team: team ? { ...team, members, memberCount: members.length } : null,
        };
      }
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

    // Validación de tamaño máximo 1MB
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
        include: { team: true },
      });
    } else {
      const user = memoryDb.users.find(u => u.id === req.user?.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      user.avatarUrl = avatarUrl;
      user.updatedAt = new Date().toISOString();
      saveStore();
      const team = (memoryDb.teams || []).find(t => t.id === user.teamId);
      updatedUser = { ...user, team: team || null };
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
          googleId: true,
          teamId: true,
          team: {
            select: { id: true, name: true },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ users });
    } else {
      const users = memoryDb.users.map(({ password: _, ...u }) => {
        const team = (memoryDb.teams || []).find(t => t.id === u.teamId);
        return {
          ...u,
          team: team ? { id: team.id, name: team.name } : null,
        };
      });
      return res.json({ users });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error listando usuarios' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, teamId } = req.body;

    let updatedUser: any = null;

    if (isPrismaAvailable && prisma) {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const updateData: any = {};
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.toLowerCase().trim();
      if (role && ['USER', 'COACH', 'ADMIN'].includes(role)) {
        updateData.role = role;
      }
      if (password && password.trim() !== '') {
        updateData.password = await bcrypt.hash(password.trim(), 10);
      }
      if (teamId !== undefined) {
        updateData.teamId = teamId || null;
      }

      updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: { team: true },
      });
    } else {
      const user = memoryDb.users.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      if (name) user.name = name.trim();
      if (email) user.email = email.toLowerCase().trim();
      if (role && ['USER', 'COACH', 'ADMIN'].includes(role)) {
        user.role = role as any;
      }
      if (password && password.trim() !== '') {
        user.password = await bcrypt.hash(password.trim(), 10);
      }
      if (teamId !== undefined) {
        user.teamId = teamId || null;
      }
      user.updatedAt = new Date().toISOString();
      saveStore();
      const team = (memoryDb.teams || []).find(t => t.id === user.teamId);
      updatedUser = { ...user, team: team || null };
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).json({ message: 'Error interno al actualizar usuario' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isPrismaAvailable && prisma) {
      const userToDelete = await prisma.user.findUnique({ where: { id } });
      if (!userToDelete) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      if (userToDelete.email === 'admin') {
        return res.status(400).json({ message: 'No es posible eliminar la cuenta principal de Administrador' });
      }

      await prisma.teamMember.deleteMany({ where: { userId: id } });
      await prisma.user.delete({ where: { id } });
    } else {
      const idx = memoryDb.users.findIndex(u => u.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      if (memoryDb.users[idx].email === 'admin') {
        return res.status(400).json({ message: 'No es posible eliminar la cuenta principal de Administrador' });
      }
      memoryDb.users.splice(idx, 1);
      memoryDb.teamMembers = (memoryDb.teamMembers || []).filter(tm => tm.userId !== id);
      saveStore();
    }

    return res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({ message: 'Error interno al eliminar usuario' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, teamId } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Nombre y correo son requeridos' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const assignedRole = ['USER', 'COACH', 'ADMIN'].includes(role) ? role : 'USER';
    const rawPass = password && password.trim() !== '' ? password.trim() : 'User123!';
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    let created: any = null;

    if (isPrismaAvailable && prisma) {
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
      }

      created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: assignedRole,
          teamId: teamId || null,
          avatarUrl: '/icons/icondefault.png',
        },
        include: { team: true },
      });
    } else {
      const existing = memoryDb.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
      }

      created = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        teamId: teamId || null,
        avatarUrl: '/icons/icondefault.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        team: null,
      };
      memoryDb.users.push(created);
      saveStore();
    }

    const { password: _, ...userWithoutPassword } = created;
    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    return res.status(500).json({ message: 'Error interno al crear usuario' });
  }
};
