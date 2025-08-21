import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'NotFound' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'InternalServerError' });
}


