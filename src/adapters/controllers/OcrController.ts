import { Response, NextFunction } from 'express';
import { OcrUseCase } from '../../core/usecases/OcrUseCase';
import { AuthenticatedRequest } from '../../frameworks/web/middlewares/authMiddleware';
import { ValidationError } from '../../core/errors/AppError';

export class OcrController {
  constructor(private ocrUseCase: OcrUseCase) {}

  process = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        throw new ValidationError('Receipt image file is required');
      }

      const suggestion = await this.ocrUseCase.execute(userId, req.file.buffer);

      res.status(200).json({
        success: true,
        data: suggestion,
      });
    } catch (error) {
      next(error);
    }
  };
}
