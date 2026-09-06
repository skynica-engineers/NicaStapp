import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createOrganizacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, tipo_institucion, municipio_id, creador_id } = req.body;

    if (!nombre || !tipo_institucion || !municipio_id || !creador_id) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const nuevaOrganizacion = await prisma.$transaction(async (tx) => {
      // 1. Crear organización
      const organizacion = await tx.organizaciones.create({
        data: {
          nombre,
          tipo_institucion,
          municipio_id: Number(municipio_id),
          creador_id,
        },
      });

      // 2. Asignar el creador como administrador de la organización
      await tx.organizacion_miembros.create({
        data: {
          organizacion_id: organizacion.id,
          perfil_id: creador_id,
          rol_interno: 'administrador',
        },
      });

      return organizacion;
    });

    res.status(201).json(nuevaOrganizacion);
  } catch (error: any) {
    console.error('Error creating organizacion:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear la organización' });
  }
};

export const updateOrganizacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, tipo_institucion, municipio_id } = req.body;

    if (!nombre || !tipo_institucion || !municipio_id) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const organizacionActualizada = await prisma.organizaciones.update({
      where: { id: String(id) },
      data: {
        nombre,
        tipo_institucion,
        municipio_id: Number(municipio_id)
      }
    });

    res.status(200).json(organizacionActualizada);
  } catch (error: any) {
    console.error('Error updating organizacion:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar la organización' });
  }
};

export const getMyOrganizaciones = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const organizaciones = await prisma.organizaciones.findMany({
      where: {
        creador_id: userId as string
      },
      include: {
        municipios: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.status(200).json(organizaciones);
  } catch (error) {
    console.error('Error fetching organizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener organizaciones' });
  }
};

export const getOrganizacionById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const organizacion = await prisma.organizaciones.findUnique({
      where: { id: id as string },
      include: {
        municipios: true,
        torneos: {
          include: {
            deportes: true
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!organizacion) {
      res.status(404).json({ error: 'Organización no encontrada' });
      return;
    }

    res.status(200).json(organizacion);
  } catch (error) {
    console.error('Error fetching organizacion:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getAcreditacionesMesa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const acreditaciones = await prisma.acreditaciones_mesa.findMany({
      where: {
        organizacion_id: id as string,
        torneo_id: null
      },
      include: {
        perfiles: true,
        deportes: true
      },
      orderBy: {
        fecha_emision: 'asc'
      }
    });
    res.status(200).json(acreditaciones);
  } catch (error) {
    console.error('Error fetching acreditaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener acreditaciones' });
  }
};

export const updateEstadoAcreditacion = async (req: Request, res: Response): Promise<void> => {
  const { acreditacionId } = req.params;
  const { estado_aprobacion } = req.body; // 'aprobado' or 'rechazado'

  try {
    const acreditacion = await prisma.acreditaciones_mesa.update({
      where: { id: acreditacionId as string },
      data: { estado_aprobacion }
    });

    if (estado_aprobacion === 'aprobado' && acreditacion.perfil_id) {
      await prisma.perfil.update({
        where: { id: acreditacion.perfil_id },
        data: { verificado: true } as any
      });
    } else if ((estado_aprobacion === 'rechazado' || estado_aprobacion === 'revocado') && !acreditacion.torneo_id) {
      // Si eliminamos/revocamos de la organización, se elimina/revoca automáticamente de todos sus torneos asignados
      await prisma.acreditaciones_mesa.updateMany({
        where: {
          perfil_id: acreditacion.perfil_id,
          organizacion_id: acreditacion.organizacion_id,
          torneo_id: { not: null }
        },
        data: { estado_aprobacion }
      });
    }

    res.status(200).json(acreditacion);
  } catch (error: any) {
    console.error('Error updating acreditacion:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar acreditacion' });
  }
};

export const getAllOrganizaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizaciones = await prisma.organizaciones.findMany({
      include: {
        municipios: true
      },
      orderBy: { nombre: 'asc' }
    });
    res.status(200).json(organizaciones);
  } catch (error: any) {
    console.error('Error fetching all organizaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createAcreditacion = async (req: Request, res: Response): Promise<void> => {
  const { id: organizacion_id } = req.params;
  const { perfil_id, deporte_id, rol_acreditacion } = req.body;

  try {
    if (!perfil_id || !deporte_id || !rol_acreditacion) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    // Verificar si ya tiene una solicitud pendiente o aprobada para esa org, deporte y rol
    const existing = await prisma.acreditaciones_mesa.findFirst({
      where: {
        perfil_id,
        organizacion_id: organizacion_id as string,
        deporte_id: Number(deporte_id),
        rol_acreditacion,
      }
    });

    if (existing) {
      if (existing.estado_aprobacion === 'pendiente' || existing.estado_aprobacion === 'aprobado') {
        res.status(400).json({ error: 'Ya existe una solicitud de acreditación para esta organización y rol.' });
        return;
      } else {
        // Si la solicitud anterior fue rechazada o revocada, la reciclamos
        const actualizada = await prisma.acreditaciones_mesa.update({
          where: { id: existing.id },
          data: { estado_aprobacion: 'pendiente', fecha_emision: new Date() }
        });
        res.status(201).json(actualizada);
        return;
      }
    }

    const nuevaAcreditacion = await prisma.acreditaciones_mesa.create({
      data: {
        perfil_id,
        organizacion_id: organizacion_id as string,
        deporte_id: Number(deporte_id),
        rol_acreditacion,
        estado_aprobacion: 'pendiente'
      }
    });

    res.status(201).json(nuevaAcreditacion);
  } catch (error: any) {
    console.error('Error creating acreditacion:', error);
    res.status(500).json({ error: 'Error interno del servidor al solicitar acreditacion' });
  }
};
