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
        isCorrect,
        feedbackGiven: feedback,
        allOptions: q.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          feedbackMessage: opt.feedbackMessage,
        })),
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (test.passingScore || 70);

    const compThresh = test.competentThreshold ?? 60;
    const profThresh = test.professionalThreshold ?? 85;
    let performanceLevel: 'PRINCIPIANTE' | 'COMPETENTE' | 'PROFESIONAL' = 'PRINCIPIANTE';
    if (percentage >= profThresh) {
      performanceLevel = 'PROFESIONAL';
    } else if (percentage >= compThresh) {
      performanceLevel = 'COMPETENTE';
    } else {
      performanceLevel = 'PRINCIPIANTE';
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

    const isAdmin = user.role === 'ADMIN';
    const { userId: filterUserId, testId } = req.query;

    if (isPrismaAvailable && prisma) {
      const where: any = {};
      if (!isAdmin) {
        where.userId = user.id;
      } else if (filterUserId) {
        where.userId = String(filterUserId);
      }
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
              competentThreshold: true,
              professionalThreshold: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
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
          if (s.percentage >= prof) level = 'PROFESIONAL';
          else if (s.percentage >= comp) level = 'COMPETENTE';
          else level = 'PRINCIPIANTE';
        }
        return {
          ...s,
          performanceLevel: level,
        };
      });

      return res.json({ submissions: formatted });
    } else {
      let list = [...memoryDb.submissions];
      if (!isAdmin) {
        list = list.filter(s => s.userId === user.id);
      } else if (filterUserId) {
        list = list.filter(s => s.userId === filterUserId);
      }
      if (testId) {
        list = list.filter(s => s.testId === testId);
      }

      const formatted = list.map(s => {
        const u = memoryDb.users.find(item => item.id === s.userId);
        const t = memoryDb.tests.find(item => item.id === s.testId);
        const comp = t?.competentThreshold ?? 60;
        const prof = t?.professionalThreshold ?? 85;
        let level = s.performanceLevel;
        if (!level) {
          if (s.percentage >= prof) level = 'PROFESIONAL';
          else if (s.percentage >= comp) level = 'COMPETENTE';
          else level = 'PRINCIPIANTE';
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
          },
          test: {
            id: t?.id || s.testId,
            title: t?.title || s.testTitle || 'Evaluación',
            phase: t?.phase || 'INTEGRAL',
            passingScore: t?.passingScore || 70,
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
            select: { id: true, name: true, email: true, avatarUrl: true },
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
      let level = (submission as any).performanceLevel;
      if (!level) {
        if (submission.percentage >= prof) level = 'PROFESIONAL';
        else if (submission.percentage >= comp) level = 'COMPETENTE';
        else level = 'PRINCIPIANTE';
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
      let level = submission.performanceLevel;
      if (!level) {
        if (submission.percentage >= prof) level = 'PROFESIONAL';
        else if (submission.percentage >= comp) level = 'COMPETENTE';
        else level = 'PRINCIPIANTE';
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
