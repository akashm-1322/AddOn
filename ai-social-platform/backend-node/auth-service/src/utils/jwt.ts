import jwt from 'jsonwebtoken';
import config from '../config';
import crypto from 'crypto';

export function signAccessToken(payload: object) {
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: config.accessTokenExp });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.refreshTokenExp });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtAccessSecret);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
