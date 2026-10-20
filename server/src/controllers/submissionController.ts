import { Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export const submitTest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const { testId, answers, timeSpentSeconds } = req.body;

    if (!testId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Identificador de test y respuestas son obligatorios' });
    }

    // Retrieve test and questions
    let test: any = null;
    let questions: any[] = [];

    if (isPrismaAvailable && prisma) {
      test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          testQuestions: {
            include: {
              question: {
                include: {
                  category: true,
                  options: true,
                },
              },
            },
          },
        },
      });

      if (!test) return res.status(404).json({ message: 'Evaluación no encontrada' });
      questions = test.testQuestions.map((tq: any) => tq.question);
    } else {
      test = memoryDb.tests.find(t => t.id === testId);
      if (!test) return res.status(404).json({ message: 'Evaluación no encontrada' });
      questions = test.questionIds
        .map((qId: string) => {
          const q = memoryDb.questions.find(item => item.id === qId);
          if (!q) return null;
          const cat = memoryDb.categories.find(c => c.id === q.categoryId);
          return { ...q, category: cat };
        })
        .filter(Boolean);
    }

    let score = 0;
    const maxScore = questions.length;
    const processedAnswers: any[] = [];

    for (const q of questions) {
      const submittedAns = answers.find(a => a.questionId === q.id);
      const selectedOptionId = submittedAns ? submittedAns.selectedOptionId : '';
      const selectedOpt = q.options.find((o: any) => o.id === selectedOptionId);

      const isCorrect = selectedOpt ? !!selectedOpt.isCorrect : false;
      const feedback = selectedOpt
        ? selectedOpt.feedbackMessage
        : 'No se seleccionó ninguna opción para esta pregunta.';
      const scoreValue = selectedOpt ? selectedOpt.scoreValue || (isCorrect ? 1 : 0) : 0;

      score += scoreValue;

      processedAnswers.push({
        questionId: q.id,
        questionTitle: q.title,
        questionContext: q.context,
        imageUrl: q.imageUrl,
        videoUrl: q.videoUrl,
        categoryName: q.category?.name || 'General',
        selectedOptionId,
        selectedOptionText: selectedOpt ? selectedOpt.text : 'Sin respuesta',
        selectedOptionImageUrl: selectedOpt ? selectedOpt.imageUrl : null,
        isCorrect,
        feedbackGiven: feedback,
        allOptions: q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
          isCorrect: opt.isCorrect,
          feedbackMessage: opt.feedbackMessage,
        })),
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (test.passingScore || 70);

    const compThresh = test.competentThreshold ?? 60;
    const profThresh = test.professionalThreshold ?? 85;
    let performanceLevel: string = 'PRINCIPIANTE';

    if (test.scaleType === '4_TIER') {
      if (percentage >= 75) {
        performanceLevel = 'EXCELENTE';
      } else if (percentage >= 50) {
        performanceLevel = 'BUENO';
      } else if (percentage >= 25) {
        performanceLevel = 'REGULAR';
      } else {
        performanceLevel = 'MALO';
      }
    } else {
      if (percentage >= profThresh) {
        performanceLevel = 'PROFESIONAL';
      } else if (percentage >= compThresh) {
        performanceLevel = 'COMPETENTE';
      } else {
        performanceLevel = 'PRINCIPIANTE';
      }
    }

    let savedSubmission: any = null;

    if (isPrismaAvailable && prisma) {
      savedSubmission = await prisma.submission.create({
        data: {
          userId,
          testId,
          score,
          maxScore,
          percentage,
          passed,
          performanceLevel,
          timeSpentSeconds: Number(timeSpentSeconds) || 0,
          answers: {
            create: processedAnswers.map(ans => ({
              questionId: ans.questionId,
              selectedOptionId: ans.selectedOptionId,
              isCorrect: ans.isCorrect,
              feedbackGiven: ans.feedbackGiven,
              categoryName: ans.categoryName,
            })),
          },
        },
        include: {
          answers: true,
          test: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } else {
      const user = memoryDb.users.find(u => u.id === userId);
      const newSub = {
        id: `sub-${Date.now()}`,
        userId,
        userName: user?.name || 'Atleta',
        userEmail: user?.email || '',
        testId,
        testTitle: test.title,
        score,
        maxScore,
        percentage,
        passed,
        performanceLevel,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        createdAt: new Date().toISOString(),
        answers: processedAnswers.map((ans, idx) => ({
          id: `sub-ans-${Date.now()}-${idx}`,
          submissionId: `sub-${Date.now()}`,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: ans.isCorrect,
          feedbackGiven: ans.feedbackGiven,
          categoryName: ans.categoryName,
        })),
      };
      memoryDb.submissions.unshift(newSub);
      saveStore();
      savedSubmission = newSub;
    }

    return res.status(201).json({
      message: passed ? '¡Felicitaciones! Has aprobado la evaluación.' : 'Evaluación completada. Revisa la retroalimentación para reforzar tus conocimientos.',
      submission: {
        ...savedSubmission,
        detailedAnswers: processedAnswers,
      },
    });
  } catch (error) {
    console.error('Error al procesar envío de evaluación:', error);
    return res.status(500).json({ message: 'Error interno al guardar resultados de evaluación' });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'No autenticado' });

    const isSuperAdmin = user.role === 'ADMIN';
    const isCoach = user.role === 'COACH';
    const isStaff = isSuperAdmin || isCoach;
    const { userId: filterUserId, testId, teamId } = req.query;

    if (isPrismaAvailable && prisma) {
      const where: any = {};

      if (!isStaff) {
        // Estudiante / Atleta: Solo ve sus propias entregas
        where.userId = user.id;
      } else if (teamId) {
        // Filtro explícito por equipo
        const teamMembers = await prisma.teamMember.findMany({
          where: { teamId: String(teamId) },
          select: { userId: true },
        });
        const directUsers = await prisma.user.findMany({
          where: { teamId: String(teamId) },
          select: { id: true },
        });
        const memberIds = Array.from(
          new Set([...teamMembers.map(tm => tm.userId), ...directUsers.map(u => u.id)])
        );
        where.userId = { in: memberIds };
        if (filterUserId) {
          where.userId = String(filterUserId);
        }
      } else if (isCoach) {
        // Técnico / Profesor: ve únicamente los estudiantes de los equipos que él creó
        const coachTeams = await prisma.team.findMany({
          where: { createdById: user.id },
          select: { id: true },
        });
        const coachTeamIds = coachTeams.map(t => t.id);
        const teamMembers = await prisma.teamMember.findMany({
          where: { teamId: { in: coachTeamIds } },
          select: { userId: true },
        });
        const directUsers = await prisma.user.findMany({
          where: { teamId: { in: coachTeamIds } },
          select: { id: true },
        });
        const coachStudentIds = Array.from(
          new Set([...teamMembers.map(tm => tm.userId), ...directUsers.map(u => u.id)])
        );

        if (filterUserId) {
          where.userId = String(filterUserId);
        } else {
          where.userId = { in: coachStudentIds };
        }
      } else if (filterUserId) {
        // Super Admin con filtro de usuario
        where.userId = String(filterUserId);
      }
      // Super Admin sin filtro: ve todo

      if (testId) where.testId = String(testId);

      const submissions = await prisma.submission.findMany({
        where,
        include: {
          test: {
            select: {
              id: true,
              title: true,
              phase: true,
              passingScore: true,
              scaleType: true,
              competentThreshold: true,
              professionalThreshold: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              teamId: true,
              team: {
                select: { id: true, name: true },
              },
            },
          },
          _count: {
            select: { answers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = submissions.map((s: any) => {
        const comp = s.test?.competentThreshold ?? 60;
        const prof = s.test?.professionalThreshold ?? 85;
        let level = s.performanceLevel;
        if (!level) {
          if (s.test?.scaleType === '4_TIER') {
            if (s.percentage >= 75) level = 'EXCELENTE';
            else if (s.percentage >= 50) level = 'BUENO';
            else if (s.percentage >= 25) level = 'REGULAR';
            else level = 'MALO';
          } else {
            if (s.percentage >= prof) level = 'PROFESIONAL';
            else if (s.percentage >= comp) level = 'COMPETENTE';
            else level = 'PRINCIPIANTE';
          }
        }
        return {
          ...s,
          performanceLevel: level,
        };
      });

      return res.json({ submissions: formatted });
    } else {
      let list = [...memoryDb.submissions];
      if (!isStaff) {
        list = list.filter(s => s.userId === user.id);
      } else if (teamId) {
        const directUserIds = memoryDb.users.filter(u => u.teamId === teamId).map(u => u.id);
        const tmUserIds = (memoryDb.teamMembers || []).filter(tm => tm.teamId === teamId).map(tm => tm.userId);
        const memberIds = new Set([...directUserIds, ...tmUserIds]);
        list = list.filter(s => memberIds.has(s.userId));
        if (filterUserId) list = list.filter(s => s.userId === filterUserId);
      } else if (isCoach) {
        const coachTeamIds = (memoryDb.teams || []).filter(t => t.createdById === user.id).map(t => t.id);
        const directUserIds = memoryDb.users.filter(u => u.teamId && coachTeamIds.includes(u.teamId)).map(u => u.id);
        const tmUserIds = (memoryDb.teamMembers || []).filter(tm => coachTeamIds.includes(tm.teamId)).map(tm => tm.userId);
        const memberIds = new Set([...directUserIds, ...tmUserIds]);
        list = list.filter(s => memberIds.has(s.userId));
        if (filterUserId) list = list.filter(s => s.userId === filterUserId);
      } else if (filterUserId) {
        list = list.filter(s => s.userId === filterUserId);
      }

      const formatted = list.map(s => {
        const u = memoryDb.users.find(item => item.id === s.userId);
        const t = memoryDb.tests.find(item => item.id === s.testId);
        const team = (memoryDb.teams || []).find(tm => tm.id === u?.teamId);
        const comp = t?.competentThreshold ?? 60;
        const prof = t?.professionalThreshold ?? 85;
        let level = s.performanceLevel;
        if (!level) {
          if (t?.scaleType === '4_TIER') {
            if (s.percentage >= 75) level = 'EXCELENTE';
            else if (s.percentage >= 50) level = 'BUENO';
            else if (s.percentage >= 25) level = 'REGULAR';
            else level = 'MALO';
          } else {
            if (s.percentage >= prof) level = 'PROFESIONAL';
            else if (s.percentage >= comp) level = 'COMPETENTE';
            else level = 'PRINCIPIANTE';
          }
        }

        return {
          id: s.id,
          userId: s.userId,
          testId: s.testId,
          score: s.score,
          maxScore: s.maxScore,
          percentage: s.percentage,
          passed: s.passed,
          performanceLevel: level,
          timeSpentSeconds: s.timeSpentSeconds,
          createdAt: s.createdAt,
          user: {
            id: u?.id || s.userId,
            name: u?.name || s.userName || 'Atleta',
            email: u?.email || s.userEmail || '',
            avatarUrl: u?.avatarUrl,
            teamId: u?.teamId || null,
            team: team ? { id: team.id, name: team.name } : null,
          },
          test: {
            id: t?.id || s.testId,
            title: t?.title || s.testTitle || 'Evaluación',
            phase: t?.phase || 'INTEGRAL',
            passingScore: t?.passingScore || 70,
            scaleType: t?.scaleType || '3_TIER',
            competentThreshold: comp,
            professionalThreshold: prof,
          },
          _count: {
            answers: s.answers?.length || 0,
          },
        };
      });

      return res.json({ submissions: formatted });
    }
  } catch (error) {
    console.error('Error al listar resultados:', error);
    return res.status(500).json({ message: 'Error interno al consultar resultados' });
  }
};

export const getSubmissionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'No autenticado' });

    const isAdmin = user.role === 'ADMIN';

    if (isPrismaAvailable && prisma) {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
          test: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              teamId: true,
              team: { select: { id: true, name: true } },
            },
          },
          answers: {
            include: {
              question: {
                include: {
                  category: true,
                  options: true,
                },
              },
              selectedOption: true,
            },
          },
        },
      });

      if (!submission) return res.status(404).json({ message: 'Resultado no encontrado' });

      // Check permission: only admin or the user who took the test can view
      if (!isAdmin && submission.userId !== user.id) {
        return res.status(403).json({ message: 'No tiene permiso para ver este resultado' });
      }

      const comp = (submission.test as any)?.competentThreshold ?? 60;
      const prof = (submission.test as any)?.professionalThreshold ?? 85;
      const is4Tier = (submission.test as any)?.scaleType === '4_TIER';
      let level = (submission as any).performanceLevel;
      if (!level) {
        if (is4Tier) {
          if (submission.percentage >= 75) level = 'EXCELENTE';
          else if (submission.percentage >= 50) level = 'BUENO';
          else if (submission.percentage >= 25) level = 'REGULAR';
          else level = 'MALO';
        } else {
          if (submission.percentage >= prof) level = 'PROFESIONAL';
          else if (submission.percentage >= comp) level = 'COMPETENTE';
          else level = 'PRINCIPIANTE';
        }
      }

      return res.json({
        submission: {
          ...submission,
          performanceLevel: level,
        },
      });
    } else {
      const submission = memoryDb.submissions.find(s => s.id === id);
      if (!submission) return res.status(404).json({ message: 'Resultado no encontrado' });

      if (!isAdmin && submission.userId !== user.id) {
        return res.status(403).json({ message: 'No tiene permiso para ver este resultado' });
      }

      const u = memoryDb.users.find(item => item.id === submission.userId);
      const t = memoryDb.tests.find(item => item.id === submission.testId);

      const comp = t?.competentThreshold ?? 60;
      const prof = t?.professionalThreshold ?? 85;
      const is4Tier = t?.scaleType === '4_TIER';
      let level = submission.performanceLevel;
      if (!level) {
        if (is4Tier) {
          if (submission.percentage >= 75) level = 'EXCELENTE';
          else if (submission.percentage >= 50) level = 'BUENO';
          else if (submission.percentage >= 25) level = 'REGULAR';
          else level = 'MALO';
        } else {
          if (submission.percentage >= prof) level = 'PROFESIONAL';
          else if (submission.percentage >= comp) level = 'COMPETENTE';
          else level = 'PRINCIPIANTE';
        }
      }

      const enrichedAnswers = submission.answers.map(ans => {
        const q = memoryDb.questions.find(item => item.id === ans.questionId);
        const cat = q ? memoryDb.categories.find(c => c.id === q.categoryId) : null;
        const selOpt = q?.options.find(o => o.id === ans.selectedOptionId);

        return {
          ...ans,
          question: q ? { ...q, category: cat } : null,
          selectedOption: selOpt || null,
        };
      });

      return res.json({
        submission: {
          ...submission,
          performanceLevel: level,
          user: {
            id: u?.id || submission.userId,
            name: u?.name || submission.userName,
            email: u?.email || submission.userEmail,
            avatarUrl: u?.avatarUrl,
            teamId: u?.teamId || null,
            team: (() => {
              const tm = (memoryDb.teams || []).find(t => t.id === u?.teamId);
              return tm ? { id: tm.id, name: tm.name } : null;
            })(),
          },
          test: t || { id: submission.testId, title: submission.testTitle },
          answers: enrichedAnswers,
        },
      });
    }
  } catch (error) {
    console.error('Error al obtener detalle de entrega:', error);
    return res.status(500).json({ message: 'Error interno al consultar entrega' });
  }
};
