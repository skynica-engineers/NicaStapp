import { Router } from 'express';
import { 
  createEquipo, 
  getAllEquipos,
  getEquiposByUsuario, 
  getEquipoById,
  getRoster,
  addAtletaToRoster,
  removeAtletaFromRoster,
  getTorneosDisponiblesParaEquipo,
  getTorneosInscritos,
  getSolicitudesVinculacion,
  resolverSolicitudVinculacion
} from '../controllers/equiposController';

const router = Router();

router.post('/', createEquipo);
router.get('/all', getAllEquipos);
router.get('/usuario/:userId', getEquiposByUsuario);
router.get('/:id', getEquipoById);

// Torneos y Roster
router.get('/:id/torneos-disponibles', getTorneosDisponiblesParaEquipo);
router.get('/:id/torneos-inscritos', getTorneosInscritos);
router.get('/:id/atletas', getRoster);
router.post('/:id/atletas', addAtletaToRoster);
router.delete('/:id/atletas/:atletaId', removeAtletaFromRoster);

// Solicitudes de vinculación (REQ-ATL-02)
router.get('/:id/solicitudes-vinculacion', getSolicitudesVinculacion);
router.put('/:id/solicitudes-vinculacion/:solicitud_id/estado', resolverSolicitudVinculacion);

export default router;
