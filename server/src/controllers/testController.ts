import { Request, Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

function sortQuestionOptions<T extends { text: string }>(options: T[]): T[] {
  if (!Array.isArray(options)) return [];
  return [...options].sort((a, b) => {
    const getPriority = (txt: string) => {
      const t = (txt || '').toLowerCase();
      if (t.includes('3-2-1')) return 1;
      if (t.includes('3-1-2')) return 2;
      if (t.includes('1-2-2-1') || t.includes('1-2-1-2')) return 3;
      if (t.includes('2-2-2') || t.includes('2-1-2-1')) return 4;
      return 99;
    };
    const pA = getPriority(a.text);
    const pB = getPriority(b.text);
    if (pA !== 99 || pB !== 99) {
      return pA - pB;
    }
    return 0;
  });
}

export const getTests = async (req: AuthRequest, res: Response) => {
  try {
    const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'COACH';

    if (isPrismaAvailable && prisma) {
      const tests = await prisma.test.findMany({
        where: isStaff ? {} : { isActive: true },
        include: {
          testQuestions: {
            include: {
              question: {
                include: {
                  category: true,
                },
              },
            },
          },
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = tests.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        phase: t.phase,
        durationMinutes: t.durationMinutes,
        passingScore: t.passingScore,
        scaleType: (t as any).scaleType || '3_TIER',
        competentThreshold: (t as any).competentThreshold ?? 60,
        professionalThreshold: (t as any).professionalThreshold ?? 85,
        isActive: t.isActive,
        createdAt: t.createdAt,
        questionCount: t.testQuestions.length,
        submissionCount: t._count.submissions,
        categories: Array.from(new Set(t.testQuestions.map(tq => tq.question.category.name))),
      }));

      return res.json({ tests: formatted });
    } else {
      let list = memoryDb.tests;
      if (!isStaff) {
        list = list.filter(t => t.isActive);
      }

      const formatted = list.map(t => {
        const questions = memoryDb.questions.filter(q => t.questionIds.includes(q.id));
        const categories = Array.from(
          new Set(
            questions
              .map(q => memoryDb.categories.find(c => c.id === q.categoryId)?.name)
              .filter(Boolean) as string[]
          )
        );
        const subCount = memoryDb.submissions.filter(s => s.testId === t.id).length;

        return {
          id: t.id,
          title: t.title,
          description: t.description,
          phase: t.phase,
          durationMinutes: t.durationMinutes,
          passingScore: t.passingScore,
          scaleType: t.scaleType || '3_TIER',
          competentThreshold: t.competentThreshold ?? 60,
          professionalThreshold: t.professionalThreshold ?? 85,
          isActive: t.isActive,
          createdAt: t.createdAt,
          questionCount: t.questionIds.length,
          submissionCount: subCount,
          categories,
        };
      });

      return res.json({ tests: formatted });
    }
  } catch (error) {
    console.error('Error al listar tests:', error);
    return res.status(500).json({ message: 'Error al obtener evaluaciones' });
  }
};

export const getTestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isStaff = req.user?.role === 'ADMIN' || req.user?.role === 'COACH';

    if (isPrismaAvailable && prisma) {
      const test = await prisma.test.findUnique({
        where: { id },
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
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!test) return res.status(404).json({ message: 'Evaluación no encontrada' });

      const questions = test.testQuestions.map(tq => ({
        id: tq.question.id,
        title: tq.question.title,
        context: tq.question.context,
        difficulty: tq.question.difficulty,
        phase: tq.question.phase,
        imageUrl: tq.question.imageUrl,
        videoUrl: tq.question.videoUrl,
        category: tq.question.category,
        options: sortQuestionOptions(tq.question.options).map(opt => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl,
          ...(isStaff ? { isCorrect: opt.isCorrect, feedbackMessage: opt.feedbackMessage } : {}),
        })),
      }));

      return res.json({
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          phase: test.phase,
          durationMinutes: test.durationMinutes,
          passingScore: test.passingScore,
          scaleType: (test as any).scaleType || '3_TIER',
          competentThreshold: (test as any).competentThreshold ?? 60,
          professionalThreshold: (test as any).professionalThreshold ?? 85,
          isActive: test.isActive,
          questions,
        },
      });
    } else {
      const test = memoryDb.tests.find(t => t.id === id);
      if (!test) return res.status(404).json({ message: 'Evaluación no encontrada' });

      const questions = test.questionIds
        .map(qId => {
          const q = memoryDb.questions.find(item => item.id === qId);
          if (!q) return null;
          const cat = memoryDb.categories.find(c => c.id === q.categoryId);
          return {
            id: q.id,
            title: q.title,
            context: q.context,
            difficulty: q.difficulty,
            phase: q.phase,
            imageUrl: q.imageUrl,
            videoUrl: q.videoUrl,
            category: cat,
            options: sortQuestionOptions(q.options).map(opt => ({
              id: opt.id,
              text: opt.text,
              imageUrl: opt.imageUrl,
              ...(isStaff ? { isCorrect: opt.isCorrect, feedbackMessage: opt.feedbackMessage } : {}),
            })),
          };
        })
        .filter(Boolean);

      return res.json({
        test: {
          ...test,
          scaleType: test.scaleType || '3_TIER',
          competentThreshold: test.competentThreshold ?? 60,
          professionalThreshold: test.professionalThreshold ?? 85,
          questions,
        },
      });
    }
  } catch (error) {
    console.error('Error al obtener detalle del test:', error);
    return res.status(500).json({ message: 'Error al consultar evaluación' });
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      phase,
      durationMinutes,
      passingScore,
      scaleType = '3_TIER',
      competentThreshold,
      professionalThreshold,
      questionIds,
    } = req.body;

    if (!title || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'Título y al menos una pregunta son requeridos' });
    }

    const normalizedScale = scaleType === '4_TIER' ? '4_TIER' : '3_TIER';
    const compThresh = Math.max(1, Math.min(98, Number(competentThreshold) || 60));
    const profThresh = Math.max(compThresh + 1, Math.min(100, Number(professionalThreshold) || 85));

    if (isPrismaAvailable && prisma) {
      const test = await prisma.test.create({
        data: {
          title: title.trim(),
          description: description || '',
          phase: phase || 'INTEGRAL',
          durationMinutes: Number(durationMinutes) || 15,
          passingScore: Number(passingScore) || 70,
          scaleType: normalizedScale,
          competentThreshold: compThresh,
          professionalThreshold: profThresh,
          testQuestions: {
            create: questionIds.map((qId: string, index: number) => ({
              questionId: qId,
              orderIndex: index,
            })),
          },
        },
      });
      return res.status(201).json({ test, message: 'Evaluación creada con éxito' });
    } else {
      const newTest: any = {
        id: `test-${Date.now()}`,
        title: title.trim(),
        description: description || '',
        phase: phase || 'INTEGRAL',
        durationMinutes: Number(durationMinutes) || 15,
        passingScore: Number(passingScore) || 70,
        scaleType: normalizedScale,
        competentThreshold: compThresh,
        professionalThreshold: profThresh,
        isActive: true,
        questionIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryDb.tests.unshift(newTest);
      saveStore();
      return res.status(201).json({ test: newTest, message: 'Evaluación creada con éxito' });
    }
  } catch (error) {
    console.error('Error al crear test:', error);
    return res.status(500).json({ message: 'Error interno al crear evaluación' });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      phase,
      durationMinutes,
      passingScore,
      scaleType = '3_TIER',
      competentThreshold,
      professionalThreshold,
      questionIds,
      isActive,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'El título es requerido' });
    }

    const normalizedScale = scaleType === '4_TIER' ? '4_TIER' : '3_TIER';
    const compThresh = Math.max(1, Math.min(98, Number(competentThreshold) || 60));
    const profThresh = Math.max(compThresh + 1, Math.min(100, Number(professionalThreshold) || 85));

    if (isPrismaAvailable && prisma) {
      if (Array.isArray(questionIds) && questionIds.length > 0) {
        await prisma.testQuestion.deleteMany({ where: { testId: id } });
        await prisma.testQuestion.createMany({
          data: questionIds.map((qId: string, index: number) => ({
            testId: id,
            questionId: qId,
            orderIndex: index,
          })),
        });
      }

      const updated = await prisma.test.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description !== undefined ? description : undefined,
          phase: phase || undefined,
          durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
          passingScore: passingScore !== undefined ? Number(passingScore) : undefined,
          scaleType: normalizedScale,
          competentThreshold: compThresh,
          professionalThreshold: profThresh,
          isActive: isActive !== undefined ? !!isActive : undefined,
        },
      });

      return res.json({ test: updated, message: 'Evaluación actualizada con éxito' });
    } else {
      const idx = memoryDb.tests.findIndex(t => t.id === id);
      if (idx === -1) return res.status(404).json({ message: 'Evaluación no encontrada' });

      memoryDb.tests[idx] = {
        ...memoryDb.tests[idx],
        title: title.trim(),
        description: description !== undefined ? description : memoryDb.tests[idx].description,
        phase: phase || memoryDb.tests[idx].phase,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : memoryDb.tests[idx].durationMinutes,
        passingScore: passingScore !== undefined ? Number(passingScore) : memoryDb.tests[idx].passingScore,
        scaleType: normalizedScale,
        competentThreshold: compThresh,
        professionalThreshold: profThresh,
        isActive: isActive !== undefined ? !!isActive : memoryDb.tests[idx].isActive,
        questionIds: Array.isArray(questionIds) && questionIds.length > 0 ? questionIds : memoryDb.tests[idx].questionIds,
        updatedAt: new Date().toISOString(),
      };
      saveStore();

      return res.json({ test: memoryDb.tests[idx], message: 'Evaluación actualizada con éxito' });
    }
  } catch (error) {
    console.error('Error al actualizar test:', error);
    return res.status(500).json({ message: 'Error interno al actualizar evaluación' });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isPrismaAvailable && prisma) {
      await prisma.test.delete({ where: { id } });
    } else {
      const idx = memoryDb.tests.findIndex(t => t.id === id);
      if (idx !== -1) {
        memoryDb.tests.splice(idx, 1);
        saveStore();
      }
    }
    return res.json({ message: 'Evaluación eliminada con éxito' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar evaluación' });
  }
};
