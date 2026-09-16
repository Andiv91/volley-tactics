import { Request, Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { categoryId, difficulty, phase } = req.query;

    if (isPrismaAvailable && prisma) {
      const where: any = {};
      if (categoryId) where.categoryId = String(categoryId);
      if (difficulty) where.difficulty = String(difficulty);
      if (phase) where.phase = String(phase);

      const questions = await prisma.question.findMany({
        where,
        include: {
          category: true,
          options: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ questions });
    } else {
      let filtered = [...memoryDb.questions];
      if (categoryId) filtered = filtered.filter(q => q.categoryId === categoryId);
      if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
      if (phase) filtered = filtered.filter(q => q.phase === phase);

      const enriched = filtered.map(q => {
        const cat = memoryDb.categories.find(c => c.id === q.categoryId);
        return {
          ...q,
          category: cat,
          options: q.options || [],
        };
      });
      return res.json({ questions: enriched });
    }
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return res.status(500).json({ message: 'Error interno al obtener preguntas' });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isPrismaAvailable && prisma) {
      const question = await prisma.question.findUnique({
        where: { id },
        include: {
          category: true,
          options: true,
        },
      });
      if (!question) return res.status(404).json({ message: 'Pregunta no encontrada' });
      return res.json({ question });
    } else {
      const question = memoryDb.questions.find(q => q.id === id);
      if (!question) return res.status(404).json({ message: 'Pregunta no encontrada' });
      const cat = memoryDb.categories.find(c => c.id === question.categoryId);
      return res.json({
        question: {
          ...question,
          category: cat,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al consultar pregunta' });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const {
      categoryId,
      title,
      context,
      difficulty,
      phase,
      imageUrl,
      videoUrl,
      options,
    } = req.body;

    if (!categoryId || !title || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: 'Categoría, título y al menos 2 opciones de respuesta con retroalimentación son requeridos.',
      });
    }

    // Validate that at least one option is correct and options have feedback
    const hasCorrect = options.some((opt: any) => opt.isCorrect === true);
    if (!hasCorrect) {
      return res.status(400).json({ message: 'Debe marcar al menos una opción como correcta' });
    }

    if (isPrismaAvailable && prisma) {
      const question = await prisma.question.create({
        data: {
          categoryId,
          title: title.trim(),
          context: context || '',
          difficulty: difficulty || 'INTERMEDIO',
          phase: phase || 'TEORICO',
          imageUrl: imageUrl || null,
          videoUrl: videoUrl || null,
          options: {
            create: options.map((opt: any) => ({
              text: opt.text.trim(),
              isCorrect: !!opt.isCorrect,
              feedbackMessage: opt.feedbackMessage || (opt.isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta.'),
              scoreValue: opt.scoreValue !== undefined ? Number(opt.scoreValue) : (opt.isCorrect ? 1 : 0),
            })),
          },
        },
        include: {
          category: true,
          options: true,
        },
      });
      return res.status(201).json({ question, message: 'Pregunta creada con éxito' });
    } else {
      const newQuestionId = `q-${Date.now()}`;
      const newOptions = options.map((opt: any, index: number) => ({
        id: `opt-${Date.now()}-${index}`,
        questionId: newQuestionId,
        text: opt.text.trim(),
        isCorrect: !!opt.isCorrect,
        feedbackMessage: opt.feedbackMessage || (opt.isCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta.'),
        scoreValue: opt.scoreValue !== undefined ? Number(opt.scoreValue) : (opt.isCorrect ? 1 : 0),
      }));

      const newQuestion = {
        id: newQuestionId,
        categoryId,
        title: title.trim(),
        context: context || '',
        difficulty: difficulty || 'INTERMEDIO',
        phase: phase || 'TEORICO',
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        options: newOptions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memoryDb.questions.unshift(newQuestion);
      saveStore();
      const cat = memoryDb.categories.find(c => c.id === categoryId);

      return res.status(201).json({
        question: { ...newQuestion, category: cat },
        message: 'Pregunta creada con éxito',
      });
    }
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    return res.status(500).json({ message: 'Error al registrar pregunta' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isPrismaAvailable && prisma) {
      await prisma.question.delete({ where: { id } });
    } else {
      const index = memoryDb.questions.findIndex(q => q.id === id);
      if (index !== -1) {
        memoryDb.questions.splice(index, 1);
        saveStore();
      }
    }
    return res.json({ message: 'Pregunta eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar pregunta' });
  }
};
