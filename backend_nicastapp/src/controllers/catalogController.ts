import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDepartamentos = async (req: Request, res: Response) => {
  try {
    const departamentos = await prisma.$queryRaw`SELECT id, nombre FROM departamentos ORDER BY nombre ASC`;
    res.status(200).json(departamentos);
  } catch (error: any) {
    console.error('Error fetching departamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor.', details: error.message });
  }
};

export const getMunicipios = async (req: Request, res: Response) => {
  try {
    const departamentoId = parseInt(req.params.departamentoId as string, 10);
    if (isNaN(departamentoId)) {
      return res.status(400).json({ error: 'ID de departamento inválido.' });
    }

    const municipios = await prisma.$queryRaw`SELECT id, nombre, departamento_id as "departamentoId" FROM municipios WHERE departamento_id = ${departamentoId} ORDER BY nombre ASC`;
    res.status(200).json(municipios);
  } catch (error) {
    console.error('Error fetching municipios:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const getComunidades = async (req: Request, res: Response) => {
  try {
    const municipioId = parseInt(req.params.municipioId as string, 10);
    if (isNaN(municipioId)) {
      return res.status(400).json({ error: 'ID de municipio inválido.' });
    }

    const comunidades = await prisma.$queryRaw`SELECT id, nombre, municipio_id as "municipioId" FROM comunidades WHERE municipio_id = ${municipioId} ORDER BY nombre ASC`;
    res.status(200).json(comunidades);
  } catch (error) {
    console.error('Error fetching comunidades:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
