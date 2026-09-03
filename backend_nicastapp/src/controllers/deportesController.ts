import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDeportes = async (req: Request, res: Response): Promise<void> => {
  try {
    const deportes = await prisma.deportes.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.status(200).json(deportes);
  } catch (error) {
    console.error('Error fetching deportes:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener disciplinas' });
  }
};
