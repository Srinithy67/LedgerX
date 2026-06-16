import { Router } from 'express';
import { expenseController } from '../../di';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', expenseController.list);
router.post('/', expenseController.create);
router.get('/:id', expenseController.get);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.delete);

export default router;
