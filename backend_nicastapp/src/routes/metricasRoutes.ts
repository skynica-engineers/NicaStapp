import { Router } from 'express';
import { getMetricasByDeporte } from '../controllers/metricasController';

const router = Router();

// Obtener métricas por deporte
router.get('/deporte/:deporteId', getMetricasByDeporte);

export default router;
