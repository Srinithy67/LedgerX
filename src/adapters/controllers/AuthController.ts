import { Response, NextFunction } from 'express';
import { AuthService } from '../../core/usecases/AuthService';
import { AuthenticatedRequest } from '../../frameworks/web/middlewares/authMiddleware';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.register(email, password);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const profile = await this.authService.getProfile(userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTheme = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { theme } = req.body;
      const profile = await this.authService.updateTheme(userId, theme);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Missing refresh token' });
        return;
      }
      const session = await this.authService.refreshSession(refreshToken);
      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };
}
