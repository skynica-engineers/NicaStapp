import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getTorneos = async (req: Request, res: Response): Promise<void> => {
  try {
    const torneos = await prisma.torneos.findMany({
      include: { deportes: true },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(torneos);
  } catch (error) {
    console.error('Error fetching torneos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createTorneo = async (req: Request, res: Response): Promise<void> => {
  const { nombre, categoria_territorial, deporte_id, organizacion_id, temporada } = req.body;

  try {
    const nuevoTorneo = await prisma.torneos.create({
      data: {
        nombre,
        categoria_territorial,
        deporte_id: parseInt(deporte_id),
        organizacion_id,
        temporada
      }
    });
    res.status(201).json(nuevoTorneo);
  } catch (error) {
    console.error('Error creating torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear torneo' });
  }
};

export const getTorneoById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const torneo = await prisma.torneos.findUnique({
      where: { id: id as string },
      include: {
        deportes: true,
        organizaciones: true,
      }
    });
    if (!torneo) {
      res.status(404).json({ error: 'Torneo no encontrado' });
      return;
    }
    res.status(200).json(torneo);
  } catch (error) {
    console.error('Error fetching torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getSolicitudesAcreditacion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rol, estado } = req.query;
  try {
    const whereClause: any = { torneo_id: id as string };
    if (rol) whereClause.rol_acreditacion = rol as string;
    if (estado) whereClause.estado_aprobacion = estado as string;

    const solicitudes = await prisma.acreditaciones_mesa.findMany({
      where: whereClause,
      include: { perfiles: true, deportes: true },
      orderBy: { fecha_emision: 'asc' }
    });
    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes de acreditación' });
  }
};

export const getEquiposTorneo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.query;
  try {
    const whereClause: any = { torneo_id: id as string };
    if (estado) whereClause.estado_inscripcion = estado as string;

    const inscripciones = await prisma.torneo_inscripciones.findMany({
      where: whereClause,
      include: {
        equipos: {
          include: { municipios: { include: { departamento: true } } }
        }
      },
      orderBy: { created_at: 'asc' }
    });
    res.status(200).json(inscripciones);
  } catch (error) {
    console.error('Error fetching equipos del torneo:', error);
    res.status(500).json({ error: 'Error al obtener equipos del torneo' });
  }
};

export const updateEstadoInscripcionEquipo = async (req: Request, res: Response): Promise<void> => {
  const { inscripcionId } = req.params;
  const { estado_inscripcion } = req.body;
  try {
    const updated = await prisma.torneo_inscripciones.update({
      where: { id: inscripcionId as string },
      data: { estado_inscripcion }
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating inscripcion:', error);
    res.status(500).json({ error: 'Error al actualizar inscripción de equipo' });
  }
};

export const updateEstadoAcreditacionTorneo = async (req: Request, res: Response): Promise<void> => {
  const { acreditacionId } = req.params;
  const { estado_aprobacion } = req.body;
  try {
    const updated = await prisma.acreditaciones_mesa.update({
      where: { id: acreditacionId as string },
      data: { estado_aprobacion }
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating acreditacion:', error);
    res.status(500).json({ error: 'Error al actualizar la acreditación' });
  }
};

export const getTorneoTablas = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    const torneo = await prisma.torneos.findUnique({
      where: { id: id as string },
      include: {
        deportes: {
          include: {
            metricas_catalogo: true
          }
        },
        encuentros: {
          include: {
            competidores_encuentro: {
              include: {
                equipos: true,
                atletas: true
              }
            },
            valores_metricas_encuentro: true
          }
        }
      }
    });

    if (!torneo) {
      res.status(404).json({ error: 'Torneo no encontrado' });
      return;
    }

    res.status(200).json(torneo);
  } catch (error) {
    console.error('Error fetching torneo tablas:', error);
    res.status(500).json({ error: 'Error interno del servidor al cargar las tablas' });
  }
};

export const updateEstadoTorneo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const updated = await prisma.torneos.update({
      where: { id: id as string },
      data: { estado } as any // bypassing TS for now until prisma generate
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating torneo estado:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del torneo' });
  }
};


export const asignarPersonalTorneo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { perfil_id, organizacion_id, deporte_id, rol_acreditacion } = req.body;

  try {
    const existing = await prisma.acreditaciones_mesa.findFirst({
      where: {
        perfil_id,
        torneo_id: id as string,
        rol_acreditacion
      }
    });

    if (existing) {
      res.status(400).json({ error: 'El perfil ya está asignado a este torneo' });
      return;
    }

    const nuevaAcreditacion = await prisma.acreditaciones_mesa.create({
      data: {
        perfil_id,
        organizacion_id,
        torneo_id: id as string,
        deporte_id,
        rol_acreditacion,
        estado_aprobacion: 'aprobado'
      }
    });
    res.status(201).json(nuevaAcreditacion);
  } catch (error) {
    console.error('Error assigning personal:', error);
    res.status(500).json({ error: 'Error interno del servidor al asignar personal' });
  }
};

export const solicitarInscripcion = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // torneoId
  const { equipo_id } = req.body;

  if (!equipo_id) {
    res.status(400).json({ error: 'El equipo_id es obligatorio' });
    return;
  }

  try {
    const existing = await prisma.torneo_inscripciones.findFirst({
      where: {
        torneo_id: id as string,
        equipo_id
      }
    });

    if (existing) {
      res.status(400).json({ error: 'El equipo ya tiene una solicitud o inscripción en este torneo' });
      return;
    }

    const inscripcion = await prisma.torneo_inscripciones.create({
      data: {
        torneo_id: id as string,
        equipo_id,
        estado_inscripcion: 'pendiente'
      }
    });

    res.status(201).json({ message: 'Solicitud enviada correctamente', inscripcion });
  } catch (error) {
    console.error('Error solicitando inscripcion:', error);
    res.status(500).json({ error: 'Error interno del servidor al solicitar inscripción' });
  }
};
