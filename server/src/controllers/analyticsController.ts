import { Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    // Si no es admin, solo puede consultar sus propias estadísticas
    const targetUserId = !isAdmin ? req.user?.id : (req.query.userId ? String(req.query.userId) : undefined);
    const targetTeamId = req.query.teamId ? String(req.query.teamId) : undefined;

    let allSubmissions: any[] = [];
    let categories: any[] = [];
    let allUsers: any[] = [];
    let allTests: any[] = [];
    let allTeams: any[] = [];

    if (isPrismaAvailable && prisma) {
      let whereClause: any = {};
      if (targetUserId) {
        whereClause.userId = targetUserId;
      } else if (targetTeamId) {
        whereClause.user = { teamId: targetTeamId };
      }

      allSubmissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          answers: {
            include: {
              question: {
                include: { category: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, teamId: true },
          },
          test: {
            select: { id: true, title: true },
          },
        },
      });

      categories = await prisma.category.findMany();
      allUsers = await prisma.user.findMany({ where: { role: 'USER' } });
      allTests = await prisma.test.findMany();
      allTeams = await prisma.team.findMany({ select: { id: true, name: true, description: true } });
    } else {
      allSubmissions = memoryDb.submissions.filter(s => {
        if (targetUserId) return s.userId === targetUserId;
        if (targetTeamId) {
          const u = memoryDb.users.find(item => item.id === s.userId);
          return u?.teamId === targetTeamId;
        }
        return true;
      });
      categories = memoryDb.categories;
      allUsers = memoryDb.users.filter(u => u.role === 'USER');
      allTests = memoryDb.tests;
      allTeams = (memoryDb.teams || []).map(t => ({ id: t.id, name: t.name, description: t.description }));
    }

    // 1. Overall KPIs
    const totalSubmissions = allSubmissions.length;
    const passedSubmissions = allSubmissions.filter(s => s.passed).length;
    const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
    const averageScore = totalSubmissions > 0
      ? Math.round(allSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions)
      : 0;

    // 2. Category Mastery Breakdown (Circular Pie Chart Data)
    // Counts correct vs total answers per category
    const categoryMap: { [catName: string]: { correct: number; total: number; color: string; id: string } } = {};

    categories.forEach(cat => {
      categoryMap[cat.name] = { correct: 0, total: 0, color: cat.color || '#ef4444', id: cat.id };
    });

    allSubmissions.forEach(sub => {
      sub.answers.forEach((ans: any) => {
        const catName = ans.categoryName || ans.question?.category?.name || 'General';
        if (!categoryMap[catName]) {
          categoryMap[catName] = { correct: 0, total: 0, color: '#f59e0b', id: 'cat-custom' };
        }
        categoryMap[catName].total += 1;
        if (ans.isCorrect) {
          categoryMap[catName].correct += 1;
        }
      });
    });

    // Circular pie / donut data structure for Recharts
    const circularPieData = Object.entries(categoryMap)
      .map(([name, stat]) => {
        const percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        return {
          name,
          value: stat.correct, // slices in pie
          total: stat.total,
          percentage,
          color: stat.color,
        };
      })
      .filter(item => item.total > 0 || !targetUserId); // show all categories if cohort view

    // 3. Difficulty Level Distribution
    const difficultyMap: { [diff: string]: { correct: number; total: number } } = {
      PRINCIPIANTE: { correct: 0, total: 0 },
      INTERMEDIO: { correct: 0, total: 0 },
      AVANZADO: { correct: 0, total: 0 },
    };

    allSubmissions.forEach(sub => {
      sub.answers.forEach((ans: any) => {
        let diff = ans.question?.difficulty;
        if (!diff) {
          const q = memoryDb.questions.find(item => item.id === ans.questionId);
          diff = q?.difficulty || 'INTERMEDIO';
        }
        if (!difficultyMap[diff]) difficultyMap[diff] = { correct: 0, total: 0 };
        difficultyMap[diff].total += 1;
        if (ans.isCorrect) difficultyMap[diff].correct += 1;
      });
    });

    const difficultyBreakdown = Object.entries(difficultyMap).map(([difficulty, data]) => ({
      difficulty,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      totalAnswered: data.total,
    }));

    // 4. Per-User Summary List (for Admin dropdown/selector)
    const filteredUsers = targetTeamId
      ? allUsers.filter(u => u.teamId === targetTeamId)
      : allUsers;

    const userSummaries = filteredUsers.map(u => {
      const userSubs = (isPrismaAvailable ? allSubmissions : memoryDb.submissions).filter(s => s.userId === u.id);
      const userTotal = userSubs.length;
      const userAvg = userTotal > 0
        ? Math.round(userSubs.reduce((acc, s) => acc + s.percentage, 0) / userTotal)
        : 0;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        testsCompleted: userTotal,
        averagePercentage: userAvg,
      };
    });

    let teamStats = null;
    if (targetTeamId) {
      const selectedTeam = allTeams.find(t => t.id === targetTeamId);
      const teamSubs = allSubmissions;
      const totalTeamSubs = teamSubs.length;
      const avgTeamPct = totalTeamSubs > 0
        ? Math.round(teamSubs.reduce((acc, s) => acc + s.percentage, 0) / totalTeamSubs)
        : 0;
      let performanceLevel: 'PRINCIPIANTE' | 'COMPETENTE' | 'PROFESIONAL' = 'PRINCIPIANTE';
      if (avgTeamPct >= 85) performanceLevel = 'PROFESIONAL';
      else if (avgTeamPct >= 60) performanceLevel = 'COMPETENTE';

      const teamMembers = allUsers.filter(u => u.teamId === targetTeamId);

      teamStats = {
        teamId: targetTeamId,
        teamName: selectedTeam?.name || 'Equipo',
        description: selectedTeam?.description || '',
        memberCount: teamMembers.length,
        totalEvaluations: totalTeamSubs,
        averagePercentage: avgTeamPct,
        performanceLevel,
        levelDistribution: {
          principiante: teamSubs.filter(s => s.performanceLevel === 'PRINCIPIANTE').length,
          competente: teamSubs.filter(s => s.performanceLevel === 'COMPETENTE').length,
          profesional: teamSubs.filter(s => s.performanceLevel === 'PROFESIONAL').length,
        },
      };
    }

    return res.json({
      kpis: {
        totalSubmissions,
        passedSubmissions,
        passRate,
        averageScore,
        totalAthletes: allUsers.length,
        totalTests: allTests.length,
      },
      circularPieData,
      difficultyBreakdown,
      userSummaries,
      teams: allTeams,
      selectedUserId: targetUserId || null,
      selectedTeamId: targetTeamId || null,
      teamStats,
    });
  } catch (error) {
    console.error('Error al calcular analíticas:', error);
    return res.status(500).json({ message: 'Error calculando analíticas y gráficos circulares' });
  }
};
