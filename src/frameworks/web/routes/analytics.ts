import { Router } from 'express';
import { analyticsController } from '../../di';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, analyticsController.get);

export default router;
