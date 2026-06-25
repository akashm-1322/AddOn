import { Request, Response, NextFunction } from 'express';
import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import config from '../config';

const redisClient = new Redis(config.redisUrl);

export const globalRateLimiter = RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args: any[]) => redisClient.call(...args) as any }),
});

export function createLimiter(opts: { windowMs?: number; max?: number }) {
  return RateLimit({
    windowMs: opts.windowMs || 60 * 1000,
    max: opts.max || 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({ sendCommand: (...args: any[]) => redisClient.call(...args) as any }),
  });
}
