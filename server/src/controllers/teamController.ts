import { Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    if (isPrismaAvailable && prisma) {
      const teams = await prisma.team.findMany({
        include: {
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = teams.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        memberCount: t.members.length,
        members: t.members,
      }));

      return res.json({ teams: formatted });
    } else {
      const formatted = (memoryDb.teams || []).map((t) => {
        const members = (memoryDb.users || [])
          .filter((u) => u.teamId === t.id)
          .map(({ password: _, ...u }) => u);
        return {
          ...t,
          memberCount: members.length,
          members,
        };
      });

      return res.json({ teams: formatted });
    }
  } catch (error) {
    console.error('Error al listar equipos:', error);
    return res.status(500).json({ message: 'Error interno al consultar equipos' });
  }
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden crear equipos' });
    }

    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'El nombre del equipo es obligatorio' });
    }

    const trimmedName = name.trim();

    if (isPrismaAvailable && prisma) {
      const existing = await prisma.team.findUnique({
        where: { name: trimmedName },
      });
      if (existing) {
        return res.status(400).json({ message: 'Ya existe un equipo con este nombre' });
      }

      const team = await prisma.team.create({
        data: {
          name: trimmedName,
          description: description?.trim() || null,
        },
        include: {
          members: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });

      return res.status(201).json({
        message: 'Equipo creado exitosamente',
        team: {
          ...team,
          memberCount: 0,
          members: [],
        },
      });
    } else {
      const existing = (memoryDb.teams || []).find(
        (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existing) {
        return res.status(400).json({ message: 'Ya existe un equipo con este nombre' });
      }

      const newTeam = {
        id: 'team-' + Date.now(),
        name: trimmedName,
        description: description?.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!memoryDb.teams) memoryDb.teams = [];
      memoryDb.teams.push(newTeam);
      saveStore();

      return res.status(201).json({
        message: 'Equipo creado exitosamente',
        team: {
          ...newTeam,
          memberCount: 0,
          members: [],
        },
      });
    }
  } catch (error) {
    console.error('Error al crear equipo:', error);
    return res.status(500).json({ message: 'Error interno al registrar el equipo' });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Solo administradores pueden eliminar equipos' });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'ID de equipo requerido' });

    if (isPrismaAvailable && prisma) {
      await prisma.user.updateMany({
        where: { teamId: id },
        data: { teamId: null },
      });

      await prisma.team.delete({
        where: { id },
      });

      return res.json({ message: 'Equipo eliminado y atletas desvinculados correctamente' });
    } else {
      memoryDb.users.forEach((u) => {
        if (u.teamId === id) {
          u.teamId = null;
        }
      });
      memoryDb.teams = (memoryDb.teams || []).filter((t) => t.id !== id);
      saveStore();

      return res.json({ message: 'Equipo eliminado y atletas desvinculados correctamente' });
    }
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    return res.status(500).json({ message: 'Error interno al eliminar equipo' });
  }
};

export const joinTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const { teamId } = req.body;

    if (isPrismaAvailable && prisma) {
      if (teamId) {
        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { teamId: teamId || null },
        include: {
          team: {
            include: {
              members: {
                select: { id: true, name: true, email: true, avatarUrl: true, role: true },
              },
            },
          },
        },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.json({
        message: teamId ? 'Te has unido al equipo exitosamente' : 'Has salido del equipo',
        user: userWithoutPassword,
        team: updatedUser.team || null,
      });
    } else {
      const user = memoryDb.users.find((u) => u.id === userId);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      let targetTeam = null;
      if (teamId) {
        targetTeam = (memoryDb.teams || []).find((t) => t.id === teamId);
        if (!targetTeam) return res.status(404).json({ message: 'Equipo no encontrado' });
      }

      user.teamId = teamId || null;
      user.updatedAt = new Date().toISOString();
      saveStore();

      const teamMembers = targetTeam
        ? memoryDb.users
            .filter((u) => u.teamId === targetTeam.id)
            .map(({ password: _, ...u }) => u)
        : [];

      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        message: teamId ? 'Te has unido al equipo exitosamente' : 'Has salido del equipo',
        user: { ...userWithoutPassword, team: targetTeam },
        team: targetTeam ? { ...targetTeam, members: teamMembers, memberCount: teamMembers.length } : null,
      });
    }
  } catch (error) {
    console.error('Error al unirse al equipo:', error);
    return res.status(500).json({ message: 'Error interno al actualizar equipo' });
  }
};

export const getMyTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    if (isPrismaAvailable && prisma) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          team: {
            include: {
              members: {
                select: { id: true, name: true, email: true, avatarUrl: true, role: true },
              },
            },
          },
        },
      });

      if (!user || !user.team) {
        return res.json({ team: null });
      }

      const memberIds = user.team.members.map((m: any) => m.id);
      const submissions = await prisma.submission.findMany({
        where: { userId: { in: memberIds } },
        select: {
          id: true,
          userId: true,
          score: true,
          maxScore: true,
          percentage: true,
          passed: true,
          performanceLevel: true,
        },
      });

      const totalSubs = submissions.length;
      const totalScore = submissions.reduce((sum: number, s: any) => sum + s.score, 0);
      const totalMaxScore = submissions.reduce((sum: number, s: any) => sum + s.maxScore, 0);
      const avgPercentage = totalSubs > 0
        ? Math.round(submissions.reduce((sum: number, s: any) => sum + s.percentage, 0) / totalSubs)
        : 0;

      let teamLevel = 'PRINCIPIANTE';
      if (avgPercentage >= 85) teamLevel = 'PROFESIONAL';
      else if (avgPercentage >= 60) teamLevel = 'COMPETENTE';

      const levelDistribution = {
        principiante: submissions.filter((s: any) => s.performanceLevel === 'PRINCIPIANTE').length,
        competente: submissions.filter((s: any) => s.performanceLevel === 'COMPETENTE').length,
        profesional: submissions.filter((s: any) => s.performanceLevel === 'PROFESIONAL').length,
      };

      return res.json({
        team: {
          id: user.team.id,
          name: user.team.name,
          description: user.team.description,
          memberCount: user.team.members.length,
          members: user.team.members,
          stats: {
            totalEvaluations: totalSubs,
            averagePercentage: avgPercentage,
            totalScore,
            totalMaxScore,
            performanceLevel: teamLevel,
            levelDistribution,
          },
        },
      });
    } else {
      const user = memoryDb.users.find((u) => u.id === userId);
      if (!user || !user.teamId) {
        return res.json({ team: null });
      }

      const team = (memoryDb.teams || []).find((t) => t.id === user.teamId);
      if (!team) return res.json({ team: null });

      const members = memoryDb.users
        .filter((u) => u.teamId === team.id)
        .map(({ password: _, ...u }) => u);
      const memberIds = members.map((m) => m.id);

      const submissions = memoryDb.submissions.filter((s) => memberIds.includes(s.userId));
      const totalSubs = submissions.length;
      const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
      const totalMaxScore = submissions.reduce((sum, s) => sum + s.maxScore, 0);
      const avgPercentage = totalSubs > 0
        ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubs)
        : 0;

      let teamLevel = 'PRINCIPIANTE';
      if (avgPercentage >= 85) teamLevel = 'PROFESIONAL';
      else if (avgPercentage >= 60) teamLevel = 'COMPETENTE';

      const levelDistribution = {
        principiante: submissions.filter((s) => s.performanceLevel === 'PRINCIPIANTE').length,
        competente: submissions.filter((s) => s.performanceLevel === 'COMPETENTE').length,
        profesional: submissions.filter((s) => s.performanceLevel === 'PROFESIONAL').length,
      };

      return res.json({
        team: {
          ...team,
          memberCount: members.length,
          members,
          stats: {
            totalEvaluations: totalSubs,
            averagePercentage: avgPercentage,
            totalScore,
            totalMaxScore,
            performanceLevel: teamLevel,
            levelDistribution,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error al obtener mi equipo:', error);
    return res.status(500).json({ message: 'Error interno al consultar equipo' });
  }
};
