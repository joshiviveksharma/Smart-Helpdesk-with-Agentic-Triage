import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export type AuthUser = { id: string; role: string };

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = verifyAccessToken(token);
    req.authUser = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.authUser) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.authUser.role)) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}


