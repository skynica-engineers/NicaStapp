import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const perfil = await prisma.perfil.findUnique({
      where: { id: id as string },
      include: {
        acreditaciones_mesa: {
          include: {
            organizaciones: true,
            deportes: true
          }
        },
        municipio: {
          include: {
            departamento: true
          }
        }
      }
    });

    if (!perfil) {
      res.status(404).json({ error: 'Perfil no encontrado' });
      return;
    }

    res.status(200).json(perfil);
  } catch (error) {
    console.error('Error fetching perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener perfil' });
  }
};

export const searchPerfiles = async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'Debe proporcionar un término de búsqueda válido' });
    return;
  }

  try {
    const perfiles = await prisma.perfil.findMany({
      where: {
        nombreCompleto: {
          contains: q,
          mode: 'insensitive' // Requires PostgreSQL
        }
      },
      take: 20 // Limit to 20 results for performance
    });

    res.status(200).json(perfiles);
  } catch (error) {
    console.error('Error searching perfiles:', error);
    res.status(500).json({ error: 'Error interno del servidor al buscar perfiles' });
  }
};
