import { Request, Response } from 'express';
import { memoryDb, isPrismaAvailable, prisma, saveStore } from '../db/prisma';

export const getCategories = async (req: Request, res: Response) => {
  try {
    if (isPrismaAvailable && prisma) {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { questions: true },
          },
        },
      });
      return res.json({ categories });
    } else {
      const categories = memoryDb.categories.map(c => ({
        ...c,
        _count: {
          questions: memoryDb.questions.filter(q => q.categoryId === c.id).length,
        },
      }));
      return res.json({ categories });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }

    if (isPrismaAvailable && prisma) {
      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          description: description || '',
          color: color || '#ef4444',
          icon: icon || 'Shield',
        },
      });
      return res.status(201).json({ category });
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        description: description || '',
        color: color || '#ef4444',
        icon: icon || 'Shield',
      };
      memoryDb.categories.push(newCat);
      saveStore();
      return res.status(201).json({ category: newCat });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear categoría' });
  }
};
