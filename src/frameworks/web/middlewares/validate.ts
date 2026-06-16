import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../../../core/errors/AppError';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => e.message).join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
}
