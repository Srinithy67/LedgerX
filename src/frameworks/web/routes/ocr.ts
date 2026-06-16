import { Router } from 'express';
import multer from 'multer';
import { ocrController } from '../../di';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Configure multer for memory storage and 10MB size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

router.post('/', authMiddleware, upload.single('receipt'), ocrController.process);

export default router;
