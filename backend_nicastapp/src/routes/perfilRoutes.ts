import { Router } from 'express';
import { getPerfil, searchPerfiles } from '../controllers/perfilController';

const router = Router();

router.get('/search', searchPerfiles);
router.get('/:id', getPerfil);

export default router;
