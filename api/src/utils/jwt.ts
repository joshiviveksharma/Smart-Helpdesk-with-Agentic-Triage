import jwt from 'jsonwebtoken';
import { appConfig } from '../config';

export type JwtPayload = {
  sub: string;
  role: string;
};

export function signAccessToken(userId: string, role: string): string {
  const payload: JwtPayload = { sub: userId, role };
  return jwt.sign(payload, appConfig.jwtSecret, { expiresIn: '1h' });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, appConfig.jwtSecret) as JwtPayload;
}


