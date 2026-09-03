import { Router } from 'express';
import {
  getTorneos,
  getTorneoTablas,
  createTorneo,
  getTorneoById,
  getSolicitudesAcreditacion,
  updateEstadoAcreditacionTorneo,
  getEquiposTorneo,
  updateEstadoInscripcionEquipo,
  asignarPersonalTorneo,
  updateEstadoTorneo,
  solicitarInscripcion,
} from '../controllers/torneosController';

const router = Router();

router.get('/', getTorneos);
router.post('/', createTorneo);

// Specific sub-routes BEFORE /:id
router.get('/:id/solicitudes', getSolicitudesAcreditacion);
router.post('/:id/acreditaciones', asignarPersonalTorneo);
router.get('/:id/equipos', getEquiposTorneo);
router.post('/:id/inscripciones', solicitarInscripcion);
router.get('/:id/tablas', getTorneoTablas);
router.get('/:id', getTorneoById);

router.put('/:id/estado', updateEstadoTorneo);
router.put('/:id/acreditaciones/:acreditacionId/estado', updateEstadoAcreditacionTorneo);
router.put('/:id/inscripciones/:inscripcionId/estado', updateEstadoInscripcionEquipo);

export default router;
