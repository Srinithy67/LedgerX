import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { UnauthorizedError } from '../../../core/errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired authentication session');
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}
