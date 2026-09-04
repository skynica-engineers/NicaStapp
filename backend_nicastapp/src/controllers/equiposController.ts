import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const createEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, deporte_id, municipio_id, administrador_id } = req.body;

    if (!nombre || !deporte_id || !municipio_id || !administrador_id) {
      res.status(400).json({ error: 'Faltan datos obligatorios para crear el equipo' });
      return;
    }

    const nuevoEquipo = await prisma.equipos.create({
      data: {
        nombre,
        deporte_id: parseInt(String(deporte_id), 10),
        municipio_id: parseInt(String(municipio_id), 10),
        administrador_id: String(administrador_id),
      },
      include: {
        deportes: true,
        municipios: {
          include: {
            departamento: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Equipo creado exitosamente', equipo: nuevoEquipo });
  } catch (error: any) {
    console.error('Error creating equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el equipo' });
  }
};

export const getAllEquipos = async (req: Request, res: Response): Promise<void> => {
  try {
    const equipos = await prisma.equipos.findMany({
      include: {
        deportes: true,
        municipios: {
          include: {
            departamento: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20
    });
    res.status(200).json(equipos);
  } catch (error: any) {
    console.error('Error fetching all equipos:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener equipos' });
  }
};

export const getEquiposByUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);

    const equipos = await prisma.equipos.findMany({
      where: {
        administrador_id: userId
      },
      include: {
        deportes: true,
        municipios: {
          include: {
            departamento: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json(equipos);
  } catch (error: any) {
    console.error('Error fetching equipos by usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener equipos' });
  }
};

export const getEquipoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const equipo = await prisma.equipos.findUnique({
      where: { id },
      include: {
        deportes: true,
        municipios: {
          include: {
            departamento: true
          }
        }
      }
    });

    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    res.status(200).json(equipo);
  } catch (error: any) {
    console.error('Error fetching equipo by id:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener el equipo' });
  }
};

export const getRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const atletas = await prisma.atletas.findMany({
      where: { equipo_id: id },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json(atletas);
  } catch (error: any) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener la plantilla' });
  }
};

export const addAtletaToRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { nombre_completo, identificacion, perfil_id } = req.body;

    if (!nombre_completo) {
      res.status(400).json({ error: 'El nombre completo es obligatorio' });
      return;
    }

    if (perfil_id) {
      const existing = await prisma.atletas.findUnique({ where: { perfil_id: String(perfil_id) } });
      if (existing) {
        res.status(400).json({ error: 'Este usuario ya está registrado como atleta en un equipo' });
        return;
      }
    }

    const nuevoAtleta = await prisma.atletas.create({
      data: {
        nombre_completo: String(nombre_completo),
        identificacion: identificacion ? String(identificacion) : null,
        perfil_id: perfil_id ? String(perfil_id) : null,
        equipo_id: id
      }
    });

    res.status(201).json({ message: 'Atleta agregado a la plantilla', atleta: nuevoAtleta });
  } catch (error: any) {
    console.error('Error adding atleta:', error);
    res.status(500).json({ error: 'Error interno del servidor al agregar el atleta' });
  }
};

export const removeAtletaFromRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const atletaId = String(req.params.atletaId);
    
    await prisma.atletas.delete({
      where: { id: atletaId }
    });

    res.status(200).json({ message: 'Atleta eliminado de la plantilla' });
  } catch (error: any) {
    console.error('Error removing atleta:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el atleta' });
  }
};

export const getTorneosDisponiblesParaEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    
    const equipo = await prisma.equipos.findUnique({ where: { id } });
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    const torneos = await prisma.torneos.findMany({
      where: {
        deporte_id: equipo.deporte_id,
        torneo_inscripciones: {
          none: {
            equipo_id: id
          }
        }
      },
      include: {
        organizaciones: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(torneos);
  } catch (error: any) {
    console.error('Error fetching torneos disponibles:', error);
    res.status(500).json({ error: 'Error al cargar los torneos disponibles' });
  }
};

export const getTorneosInscritos = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const inscripciones = await prisma.torneo_inscripciones.findMany({
      where: { equipo_id: id },
      include: {
        torneos: {
          include: {
            organizaciones: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json(inscripciones);
  } catch (error: any) {
    console.error('Error fetching torneos inscritos:', error);
    res.status(500).json({ error: 'Error al cargar los torneos inscritos' });
  }
};

// ==========================================
// Solicitudes de Vinculación (REQ-ATL-02)
// ==========================================

export const getSolicitudesVinculacion = async (req: Request, res: Response) => {
  try {
    const equipo_id = String(req.params.id);

    const solicitudes = await prisma.solicitudes_vinculacion_atleta.findMany({
      where: {
        estado_solicitud: 'pendiente',
        atletas: {
          equipo_id
        }
      },
      include: {
        atletas: true,
        perfiles: true
      }
    });

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes vinculacion:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes de vinculación' });
  }
};

export const resolverSolicitudVinculacion = async (req: Request, res: Response) => {
  try {
    const equipo_id = String(req.params.id);
    const solicitud_id = String(req.params.solicitud_id);
    const { estado } = req.body; // 'aprobada' | 'rechazada'

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const solicitud = await prisma.solicitudes_vinculacion_atleta.findUnique({
      where: { id: solicitud_id }
    });

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const updated = await prisma.solicitudes_vinculacion_atleta.update({
      where: { id: solicitud_id },
      data: { estado_solicitud: String(estado) }
    });

    if (estado === 'aprobada') {
      await prisma.atletas.update({
        where: { id: solicitud.atleta_id },
        data: { perfil_id: solicitud.perfil_id }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error al resolver solicitud vinculacion:', error);
    res.status(500).json({ error: 'Error al resolver solicitud de vinculación' });
  }
};
