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
        deporte_id: parseInt(deporte_id, 10),
        municipio_id: parseInt(municipio_id, 10),
        administrador_id,
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

export const getEquiposByUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

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
    const { id } = req.params;

    const equipo = await prisma.equipos.findUnique({
      where: { id },
      include: {
        deportes: true,
        municipios: {
          include: {
            departamento: true
          }
        },
        perfiles: true // Administrador profile info
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
    const { id } = req.params;
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
    const { id } = req.params;
    const { nombre_completo, identificacion, perfil_id } = req.body;

    if (!nombre_completo) {
      res.status(400).json({ error: 'El nombre completo es obligatorio' });
      return;
    }

    // Si envía perfil_id, verificamos que no esté ya en la tabla atletas (perfil_id es @unique en schema)
    if (perfil_id) {
      const existing = await prisma.atletas.findUnique({ where: { perfil_id } });
      if (existing) {
        res.status(400).json({ error: 'Este usuario ya está registrado como atleta en un equipo' });
        return;
      }
    }

    const nuevoAtleta = await prisma.atletas.create({
      data: {
        nombre_completo,
        identificacion: identificacion || null,
        perfil_id: perfil_id || null,
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
    const { id, atletaId } = req.params;
    
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
    const { id } = req.params;
    
    const equipo = await prisma.equipos.findUnique({ where: { id } });
    if (!equipo) {
      res.status(404).json({ error: 'Equipo no encontrado' });
      return;
    }

    const torneos = await prisma.torneos.findMany({
      where: {
        deporte_id: equipo.deporte_id,
        // En un futuro podríamos filtrar por estado = 'abierto', por ahora traemos todos.
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
    const { id } = req.params;

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
