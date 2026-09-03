import { Router } from 'express';
import { 
  createEquipo, 
  getEquiposByUsuario, 
  getEquipoById,
  getRoster,
  addAtletaToRoster,
  removeAtletaFromRoster,
  getTorneosDisponiblesParaEquipo,
  getTorneosInscritos
} from '../controllers/equiposController';

const router = Router();

router.post('/', createEquipo);
router.get('/usuario/:userId', getEquiposByUsuario);
router.get('/:id', getEquipoById);
router.get('/:id/torneos-disponibles', getTorneosDisponiblesParaEquipo);
router.get('/:id/torneos-inscritos', getTorneosInscritos);
router.get('/:id/atletas', getRoster);
router.post('/:id/atletas', addAtletaToRoster);
router.delete('/:id/atletas/:atletaId', removeAtletaFromRoster);

export default router;
