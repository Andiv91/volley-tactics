import { Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const getTeams = async (req: AuthRequest, res: Response) => {
  try {
    if (isPrismaAvailable && prisma) {
      const teams = await prisma.team.findMany({
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          members: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              role: true,
            },
          },
          teamMemberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = teams.map((t: any) => {
        const memberMap = new Map<string, any>();
        for (const m of t.members) {
          memberMap.set(m.id, m);
        }
        for (const tm of t.teamMemberships || []) {
          if (tm.user) {
            memberMap.set(tm.user.id, tm.user);
          }
        }
        const allMembers = Array.from(memberMap.values());

        return {
          id: t.id,
          name: t.name,
          description: t.description,
          createdById: t.createdById,
          createdBy: t.createdBy,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          memberCount: allMembers.length,
          members: allMembers,
        };
      });

      return res.json({ teams: formatted });
    } else {
      const formatted = (memoryDb.teams || []).map((t) => {
        const directMembers = (memoryDb.users || []).filter((u) => u.teamId === t.id);
        const tmUserIds = (memoryDb.teamMembers || []).filter(tm => tm.teamId === t.id).map(tm => tm.userId);
        const tmUsers = (memoryDb.users || []).filter(u => tmUserIds.includes(u.id));

        const memberMap = new Map<string, any>();
        for (const m of [...directMembers, ...tmUsers]) {
          const { password: _, ...clean } = m;
          memberMap.set(clean.id, clean);
        }
        const allMembers = Array.from(memberMap.values());

        const creator = (memoryDb.users || []).find(u => u.id === t.createdById);

        return {
          ...t,
          createdBy: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
          memberCount: allMembers.length,
          members: allMembers,
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
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'COACH') {
      return res.status(403).json({ message: 'Solo administradores o profesores pueden crear equipos' });
    }

    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'El nombre del equipo es obligatorio' });
    }

    const trimmedName = name.trim();
    const createdById = req.user?.id || null;

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
          createdById,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
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
        createdById: createdById || undefined,
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

export const addStudentToTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'COACH') {
      return res.status(403).json({ message: 'Solo administradores o profesores pueden gestionar integrantes' });
    }

    const { id: teamId } = req.params;
    const { studentId } = req.body;

    if (!teamId || !studentId) {
      return res.status(400).json({ message: 'ID de equipo y de estudiante son requeridos' });
    }

    if (isPrismaAvailable && prisma) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });

      const student = await prisma.user.findUnique({ where: { id: studentId } });
      if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });

      // Add to team_members table
      await prisma.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId,
            userId: studentId,
          },
        },
        create: {
          teamId,
          userId: studentId,
        },
        update: {},
      });

      // Also set primary teamId if student doesn't have one
      if (!student.teamId) {
        await prisma.user.update({
          where: { id: studentId },
          data: { teamId },
        });
      }

      return res.json({ message: `¡${student.name} agregado al equipo ${team.name} exitosamente!` });
    } else {
      const team = (memoryDb.teams || []).find(t => t.id === teamId);
      if (!team) return res.status(404).json({ message: 'Equipo no encontrado' });

      const student = memoryDb.users.find(u => u.id === studentId);
      if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });

      if (!memoryDb.teamMembers) memoryDb.teamMembers = [];
      if (!memoryDb.teamMembers.some(tm => tm.teamId === teamId && tm.userId === studentId)) {
        memoryDb.teamMembers.push({
          id: `tm-${Date.now()}`,
          teamId,
          userId: studentId,
          createdAt: new Date().toISOString(),
        });
      }
      if (!student.teamId) {
        student.teamId = teamId;
      }
      saveStore();

      return res.json({ message: `¡${student.name} agregado al equipo ${team.name} exitosamente!` });
    }
  } catch (error) {
    console.error('Error al agregar estudiante al equipo:', error);
    return res.status(500).json({ message: 'Error interno al agregar estudiante al equipo' });
  }
};

export const removeStudentFromTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'COACH') {
      return res.status(403).json({ message: 'Solo administradores o profesores pueden gestionar integrantes' });
    }

    const { id: teamId, studentId } = req.params;

    if (!teamId || !studentId) {
      return res.status(400).json({ message: 'ID de equipo y de estudiante son requeridos' });
    }

    if (isPrismaAvailable && prisma) {
      await prisma.teamMember.deleteMany({
        where: {
          teamId,
          userId: studentId,
        },
      });

      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: { teamMemberships: true },
      });

      if (student && student.teamId === teamId) {
        const otherMembership = student.teamMemberships.find(tm => tm.teamId !== teamId);
        await prisma.user.update({
          where: { id: studentId },
          data: { teamId: otherMembership ? otherMembership.teamId : null },
        });
      }

      return res.json({ message: 'Estudiante retirado del equipo exitosamente' });
    } else {
      if (memoryDb.teamMembers) {
        memoryDb.teamMembers = memoryDb.teamMembers.filter(
          tm => !(tm.teamId === teamId && tm.userId === studentId)
        );
      }
      const student = memoryDb.users.find(u => u.id === studentId);
      if (student && student.teamId === teamId) {
        student.teamId = null;
      }
      saveStore();
      return res.json({ message: 'Estudiante retirado del equipo exitosamente' });
    }
  } catch (error) {
    console.error('Error al retirar estudiante del equipo:', error);
    return res.status(500).json({ message: 'Error interno al retirar estudiante' });
  }
};

export const getAvailableStudents = async (req: AuthRequest, res: Response) => {
  try {
    if (isPrismaAvailable && prisma) {
      const students = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          teamId: true,
          team: { select: { id: true, name: true } },
          teamMemberships: {
            select: {
              teamId: true,
              team: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { name: 'asc' },
      });
      return res.json({ students });
    } else {
      const students = (memoryDb.users || []).map(({ password: _, ...u }) => {
        const team = (memoryDb.teams || []).find(t => t.id === u.teamId);
        return {
          ...u,
          team: team ? { id: team.id, name: team.name } : null,
          teamMemberships: [],
        };
      });
      return res.json({ students });
    }
  } catch (error) {
    console.error('Error al listar estudiantes:', error);
    return res.status(500).json({ message: 'Error interno al consultar estudiantes' });
  }
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'COACH') {
      return res.status(403).json({ message: 'Solo administradores o profesores pueden eliminar equipos' });
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
              createdBy: { select: { id: true, name: true, email: true } },
              members: {
                select: { id: true, name: true, email: true, avatarUrl: true, role: true },
              },
            },
          },
        },
      });

      // Sincronizar tabla team_members para redundancia y consultas de auditoría
      if (teamId) {
        await prisma.teamMember.upsert({
          where: {
            teamId_userId: {
              teamId,
              userId,
            },
          },
          create: {
            teamId,
            userId,
          },
          update: {},
        });
      } else {
        await prisma.teamMember.deleteMany({
          where: { userId },
        });
      }

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

      if (teamId) {
        if (!memoryDb.teamMembers) memoryDb.teamMembers = [];
        if (!memoryDb.teamMembers.some((tm) => tm.teamId === teamId && tm.userId === userId)) {
          memoryDb.teamMembers.push({
            id: `tm-${Date.now()}`,
            teamId,
            userId,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        if (memoryDb.teamMembers) {
          memoryDb.teamMembers = memoryDb.teamMembers.filter((tm) => tm.userId !== userId);
        }
      }

      saveStore();

      const teamMembers = targetTeam
        ? memoryDb.users
            .filter((u) => u.teamId === targetTeam.id || (memoryDb.teamMembers || []).some((tm) => tm.teamId === targetTeam.id && tm.userId === u.id))
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

      let targetTeam = user?.team;
      if (!targetTeam && user?.teamMemberships && user.teamMemberships.length > 0) {
        targetTeam = user.teamMemberships[0].team;
      }

      if (!targetTeam) {
        return res.json({ team: null });
      }

      const memberIds = (targetTeam.members || []).map((m: any) => m.id);
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
          id: targetTeam.id,
          name: targetTeam.name,
          description: targetTeam.description,
          createdBy: targetTeam.createdBy,
          memberCount: targetTeam.members ? targetTeam.members.length : 0,
          members: targetTeam.members,
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
      if (!user) {
        return res.json({ team: null });
      }

      let targetTeamId = user.teamId;
      if (!targetTeamId) {
        const tm = (memoryDb.teamMembers || []).find((t) => t.userId === userId);
        if (tm) targetTeamId = tm.teamId;
      }
      if (!targetTeamId) {
        return res.json({ team: null });
      }

      const team = (memoryDb.teams || []).find((t) => t.id === targetTeamId);
      if (!team) return res.json({ team: null });

      const members = memoryDb.users
        .filter((u) => u.teamId === team.id || (memoryDb.teamMembers || []).some((tm) => tm.teamId === team.id && tm.userId === u.id))
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
