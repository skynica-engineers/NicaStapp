import { Router } from 'express';
import { getAtletaFicha, reclamarFicha } from '../controllers/atletasController';

const router = Router();

router.get('/:id/ficha', getAtletaFicha);
router.post('/:id/reclamar', reclamarFicha);

export default router;
