import { Router } from 'express';
import { getHomeFeed } from '../controllers/feedController';

const router = Router();

router.get('/home', getHomeFeed);

export default router;
