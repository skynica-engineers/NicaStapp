import { Router } from 'express';
import { createOrganizacion, getMyOrganizaciones, getOrganizacionById, getAcreditacionesMesa, updateEstadoAcreditacion, getAllOrganizaciones, createAcreditacion } from '../controllers/organizacionesController';

const router = Router();

router.post('/', createOrganizacion);
router.get('/', getAllOrganizaciones);
router.get('/usuario/:userId', getMyOrganizaciones);
// IMPORTANT: specific sub-routes MUST come before /:id to avoid Express catching them
router.get('/:id', getOrganizacionById);

// Comunicados (REQ-ORG-05)
import { getComunicados, createComunicado } from '../controllers/comunicadosController';
router.get('/:id/comunicados', getComunicados);
router.post('/:id/comunicados', createComunicado);

// Acreditaciones
router.get('/:id/acreditaciones', getAcreditacionesMesa);
router.post('/:id/acreditaciones', createAcreditacion);
router.put('/acreditaciones/:acreditacionId/estado', updateEstadoAcreditacion);

export default router;
