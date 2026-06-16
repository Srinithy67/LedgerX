import { Router } from 'express';
import { authController } from '../../di';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../../../core/validation/schemas';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.patch('/profile/theme', authMiddleware, authController.updateTheme);

export default router;
