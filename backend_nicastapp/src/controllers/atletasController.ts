import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAtletas = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const atletas = await prisma.atletas.findMany();
    res.status(200).json(atletas);
  } catch (error) {
    console.error('Error in getAtletas:', error);
    res.status(500).json({ error: 'Error al obtener atletas' });
  }
};

export const getAtletaFicha = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const atleta = await prisma.atletas.findUnique({
      where: { id },
      include: {
        equipos: {
          include: {
            municipios: {
              include: { departamento: true }
            },
            deportes: true
          }
        },
        valores_metricas_encuentro: {
          include: {
            metricas_catalogo: true,
            encuentros: {
              include: {
                torneos: {
                  include: {
                    deportes: true
                  }
                }
              }
            }
          }
        },
        torneo_inscripciones: {
          where: { estado_inscripcion: 'aprobado' },
          include: {
            equipos: true,
            torneos: true
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!atleta) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    let perfil = null;
    if (atleta.perfil_id) {
      perfil = await prisma.perfil.findUnique({
        where: { id: atleta.perfil_id },
        include: {
          municipio: {
            include: { departamento: true }
          }
        }
      });
    }

    // Agrupar métricas acumuladas globales
    const statsMap = new Map();
    // Agrupar métricas por torneo
    const torneoMap = new Map();

    atleta.valores_metricas_encuentro.forEach((vm: any) => {
      // GLOBAL
      const key = vm.metrica_id;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          nombre_visible: vm.metricas_catalogo.nombre_visible,
          clave_metrica: vm.metricas_catalogo.clave_metrica,
          total: 0
        });
      }
      statsMap.get(key).total += Number(vm.valor_registrado);

      // POR TORNEO
      const torneo = vm.encuentros?.torneos;
      if (torneo) {
        if (!torneoMap.has(torneo.id)) {
          torneoMap.set(torneo.id, {
            id: torneo.id,
            nombre: torneo.nombre,
            categoria_territorial: torneo.categoria_territorial,
            temporada: torneo.temporada,
            deporte: torneo.deportes?.nombre,
            metricasMap: new Map() // Internamente un map de métricas
          });
        }

        const tData = torneoMap.get(torneo.id);
        if (!tData.metricasMap.has(key)) {
          tData.metricasMap.set(key, {
            nombre_visible: vm.metricas_catalogo.nombre_visible,
            clave_metrica: vm.metricas_catalogo.clave_metrica,
            total: 0
          });
        }
        tData.metricasMap.get(key).total += Number(vm.valor_registrado);
      }
    });

    const metricas_globales = Array.from(statsMap.values());
    const metricas_por_torneo = Array.from(torneoMap.values()).map(t => ({
      ...t,
      metricasMap: undefined,
      metricas_acumuladas: Array.from(t.metricasMap.values())
    }));

    const historial_equipos = (atleta.torneo_inscripciones || []).map((insc: any) => ({
      id_inscripcion: insc.id,
      equipo: insc.equipos,
      torneo: insc.torneos,
      fecha: insc.created_at
    }));

    return res.status(200).json({
      atleta: {
        id: atleta.id,
        nombre_completo: atleta.nombre_completo,
        identificacion: atleta.identificacion,
        created_at: atleta.created_at,
        equipo_actual: atleta.equipos,
      },
      perfil_vinculado: perfil ? {
        id: perfil.id,
        avatarUrl: perfil.avatarUrl,
        verificado: perfil.verificado,
        municipio: perfil.municipio,
      } : null,
      metricas_globales,
      metricas_por_torneo,
      historial_equipos
    });

  } catch (error) {
    console.error('Error in getAtletaFicha:', error);
    res.status(500).json({ error: 'Error al obtener ficha del atleta' });
  }
};

export const reclamarFicha = async (req: Request, res: Response) => {
  try {
    const atleta_id = String(req.params.id);
    const { perfil_id } = req.body; // El perfil_id que quiere reclamar la ficha

    if (!perfil_id) {
      return res.status(400).json({ error: 'Falta perfil_id' });
    }

    const atleta = await prisma.atletas.findUnique({
      where: { id: atleta_id },
    });

    if (!atleta) {
      return res.status(404).json({ error: 'Atleta no encontrado' });
    }

    if (atleta.perfil_id) {
      return res.status(400).json({ error: 'Esta ficha ya está vinculada a un perfil' });
    }

    // Verificar si ya existe una solicitud pendiente
    const existing = await prisma.solicitudes_vinculacion_atleta.findFirst({
      where: {
        atleta_id,
        estado_solicitud: 'pendiente'
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya existe una solicitud pendiente para esta ficha' });
    }

    const solicitud = await prisma.solicitudes_vinculacion_atleta.create({
      data: {
        atleta_id,
        perfil_id,
        estado_solicitud: 'pendiente'
      }
    });

    return res.status(201).json({ message: 'Solicitud enviada correctamente', solicitud });
  } catch (error) {
    console.error('Error en reclamarFicha:', error);
    res.status(500).json({ error: 'Error al reclamar ficha' });
  }
};
