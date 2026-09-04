import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getMetricasByDeporte = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.deporteId);

    const metricas = await prisma.metricas_catalogo.findMany({
      where: {
        deporte_id: parseInt(id, 10)
      },
      orderBy: {
        id: 'asc'
      }
    });

    res.status(200).json(metricas);
  } catch (error) {
    console.error('Error fetching metricas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
