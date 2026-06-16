import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core/errors/AppError';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If it's a custom application error, return its status code and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Log unexpected errors
  console.error('Unhandled Server Error:', err);

  // Return a generic internal error message
  return res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred. Please try again later.',
  });
}
