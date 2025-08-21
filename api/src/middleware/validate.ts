import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody(schema: AnyZodObject) {
  return function (req: Request, res: Response, next: NextFunction) {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ error: 'ValidationFailed', details: err.errors });
      }
      return next(err);
    }
  };
}


