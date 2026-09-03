import { Router } from 'express';
import { getEncuentrosByTorneo, createEncuentro, getMisAsignacionesTecnico, finalizarEncuentro, getEncuentroById } from '../controllers/encuentrosController';

const router = Router();

// Obtener los encuentros de un torneo
router.get('/torneo/:torneoId', getEncuentrosByTorneo);

// Rutas de Mesa Técnica
router.get('/mis-asignaciones/tecnico/:perfilId', getMisAsignacionesTecnico);
router.post('/:id/finalizar', finalizarEncuentro);
router.get('/:id', getEncuentroById);

// Crear un nuevo encuentro
router.post('/', createEncuentro);

export default router;
