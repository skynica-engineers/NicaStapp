import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getComunicados = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: organizacionId } = req.params;
    const { torneoId } = req.query;

    if (!organizacionId) {
      res.status(400).json({ error: 'organizacionId es requerido' });
      return;
    }

    // Build query conditions
    const whereClause: any = {
      organizacion_id: String(organizacionId),
    };

    if (torneoId) {
      whereClause.torneo_id = String(torneoId);
    } else {
      // By default, if no torneoId is provided, maybe we want only general comunicados?
      // Or maybe we want ALL comunicados for the org.
      // Let's assume without torneoId, we fetch general ones:
      whereClause.torneo_id = null;
    }

    const comunicados = await prisma.comunicados.findMany({
      where: whereClause,
      orderBy: { fecha_publicacion: 'desc' },
      include: {
        torneos: { select: { nombre: true } } // include torneo name just in case
      }
    });

    res.json(comunicados);
  } catch (error) {
    console.error('Error fetching comunicados:', error);
    res.status(500).json({ error: 'Error al obtener comunicados' });
  }
};

export const createComunicado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: organizacion_id } = req.params;
    const { torneo_id, titulo, contenido, tipo_aviso } = req.body;

    if (!organizacion_id || !titulo || !contenido || !tipo_aviso) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const nuevoComunicado = await prisma.comunicados.create({
      data: {
        organizacion_id: String(organizacion_id),
        torneo_id: torneo_id || null,
        titulo,
        contenido,
        tipo_aviso,
      },
    });

    res.status(201).json(nuevoComunicado);
  } catch (error) {
    console.error('Error creating comunicado:', error);
    res.status(500).json({ error: 'Error al crear comunicado' });
  }
};
