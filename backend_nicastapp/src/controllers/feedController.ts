import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getHomeFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const encuentros = await prisma.encuentros.findMany({
      where: {
        estado_encuentro: {
          in: ['programado', 'en_curso']
        }
      },
      include: {
        torneos: {
          include: {
            deportes: true
          }
        },
        competidores_encuentro: {
          include: {
            equipos: {
              include: {
                municipios: {
                  include: {
                    departamento: true
                  }
                }
              }
            },
            atletas: true
          }
        }
      },
      orderBy: {
        fecha_hora: 'asc'
      },
      take: 20
    });

    res.status(200).json(encuentros);
  } catch (error) {
    console.error('Error fetching home feed:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar el feed' });
  }
};
