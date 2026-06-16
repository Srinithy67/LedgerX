import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../../core/usecases/AnalyticsService';
import { AuthenticatedRequest } from '../../frameworks/web/middlewares/authMiddleware';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const analytics = await this.analyticsService.getAnalytics(userId);
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };
}
