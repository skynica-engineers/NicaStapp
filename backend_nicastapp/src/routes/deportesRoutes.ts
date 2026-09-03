import { Router } from 'express';
import { getDeportes } from '../controllers/deportesController';

const router = Router();

router.get('/', getDeportes);

export default router;
