import { Router } from 'express';
import { getDepartamentos, getMunicipios, getComunidades } from '../controllers/catalogController';

const router = Router();

router.get('/departamentos', getDepartamentos);
router.get('/municipios/:departamentoId', getMunicipios);
router.get('/comunidades/municipio/:municipioId', getComunidades);

export default router;
