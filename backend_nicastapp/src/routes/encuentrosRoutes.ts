import { Router } from 'express';
import { getEncuentrosByTorneo, createEncuentro, getMisAsignacionesTecnico, finalizarEncuentro, getEncuentroById, getAllEncuentros } from '../controllers/encuentrosController';

const router = Router();

// Obtener todos los encuentros globales
router.get('/all', getAllEncuentros);

// Obtener los encuentros de un torneo
router.get('/torneo/:torneoId', getEncuentrosByTorneo);

// Rutas de Mesa Técnica
router.get('/mis-asignaciones/tecnico/:perfilId', getMisAsignacionesTecnico);
router.post('/:id/finalizar', finalizarEncuentro);
router.get('/:id', getEncuentroById);

// Crear un nuevo encuentro
router.post('/', createEncuentro);

export default router;
