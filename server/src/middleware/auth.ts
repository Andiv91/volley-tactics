import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { memoryDb } from '../db/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'COACH' | 'USER' | string;
    name: string;
  };
}

export const authenticateJwt = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No se ha proporcionado token de autenticación' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: 'ADMIN' | 'COACH' | 'USER' | string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token de autenticación inválido o expirado' });
  }
};

// Permite acceso a Técnicos (COACH) y Administradores (ADMIN)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'COACH')) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de Técnico o Administrador' });
  }
  next();
};

export const requireTechnicianOrAdmin = requireAdmin;

// Exclusivo para el usuario Super Administrador
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso exclusivo del Administrador del sistema' });
  }
  next();
};
