import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEncuentrosByTorneo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId } = req.params;

    const encuentros = await prisma.encuentros.findMany({
      where: { torneo_id: torneoId as string },
      include: {
        perfiles: { // anotador
          select: { nombreCompleto: true }
        },
        competidores_encuentro: {
          include: {
            equipos: {
              select: { nombre: true, id: true }
            },
            atletas: {
              select: { nombre_completo: true, id: true }
            }
          }
        }
      },
      orderBy: { fecha_hora: 'asc' }
    });

    res.json(encuentros);
  } catch (error: any) {
    console.error('Error fetching encuentros:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener encuentros' });
  }
};

export const getMisAsignacionesTecnico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { perfilId } = req.params;

    const encuentros = await prisma.encuentros.findMany({
      where: { anotador_id: perfilId as string },
      include: {
        torneos: {
          select: { nombre: true, deporte_id: true }
        },
        competidores_encuentro: {
          include: {
            equipos: {
              select: { nombre: true, id: true }
            },
            atletas: {
              select: { nombre_completo: true, id: true }
            }
          }
        }
      },
      orderBy: { fecha_hora: 'asc' }
    });

    res.json(encuentros);
  } catch (error: any) {
    console.error('Error fetching mis asignaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getEncuentroById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const encuentro = await prisma.encuentros.findUnique({
      where: { id: id as string },
      include: {
        torneos: { select: { nombre: true, deporte_id: true } },
        competidores_encuentro: {
          include: {
            equipos: { select: { nombre: true, id: true } },
            atletas: { select: { nombre_completo: true, id: true } }
          }
        }
      }
    });

    if (!encuentro) {
      res.status(404).json({ error: 'Encuentro no encontrado' });
      return;
    }

    res.json(encuentro);
  } catch (error: any) {
    console.error('Error fetching encuentro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const finalizarEncuentro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { metricas, nomina } = req.body;
    // metricas = [{ competidor_encuentro_id, metrica_id, valor, atleta_id? }]
    // nomina = [{ competidor_encuentro_id, atleta_id, es_titular, posicion_rol? }]

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Guardar nómina
      if (nomina && nomina.length > 0) {
        await tx.participantes_acta.createMany({
          data: nomina.map((n: any) => ({
            competidor_encuentro_id: n.competidor_encuentro_id,
            atleta_id: n.atleta_id,
            es_titular: n.es_titular ?? true,
            posicion_rol: n.posicion_rol || null,
          }))
        });
      }

      // 2. Guardar métricas/resultados
      if (metricas && metricas.length > 0) {
        await tx.valores_metricas_encuentro.createMany({
          data: metricas.map((m: any) => ({
            competidor_encuentro_id: m.competidor_encuentro_id,
            metrica_id: m.metrica_id,
            valor_metrica: m.valor,
            atleta_id: m.atleta_id || null, // opcional, para métricas individuales
          }))
        });
      }

      // 3. Cambiar estado a finalizado
      await tx.encuentros.update({
        where: { id: id as string },
        data: { estado_encuentro: 'finalizado' }
      });
    });

    res.json({ message: 'Encuentro finalizado exitosamente' });
  } catch (error: any) {
    console.error('Error finalizando encuentro:', error);
    res.status(500).json({ error: 'Error interno del servidor al finalizar encuentro' });
  }
};

export const createEncuentro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneo_id, anotador_id, fecha_hora, sede_instalacion, competidores } = req.body;
    // competidores should be an array of 2 objects:
    // { equipo_id: string, rol_posicion_etiqueta: 'Local' | 'Visitante' }
    // OR
    // { atleta_id: string, rol_posicion_etiqueta: 'Local' | 'Visitante' }

    if (!torneo_id || !anotador_id || !fecha_hora || !sede_instalacion || !competidores || competidores.length !== 2) {
      res.status(400).json({ error: 'Faltan datos obligatorios para programar el encuentro' });
      return;
    }

    const newEncuentro = await prisma.encuentros.create({
      data: {
        torneo_id,
        anotador_id,
        fecha_hora: new Date(fecha_hora),
        sede_instalacion,
        estado_encuentro: 'programado',
        competidores_encuentro: {
          create: competidores.map((c: any) => ({
            equipo_id: c.equipo_id || null,
            atleta_id: c.atleta_id || null,
            rol_posicion_etiqueta: c.rol_posicion_etiqueta
          }))
        }
      },
      include: {
        competidores_encuentro: true
      }
    });

    res.status(201).json({ message: 'Encuentro programado exitosamente', encuentro: newEncuentro });
  } catch (error: any) {
    console.error('Error creating encuentro:', error);
    res.status(500).json({ error: 'Error interno del servidor al programar el encuentro' });
  }
};
