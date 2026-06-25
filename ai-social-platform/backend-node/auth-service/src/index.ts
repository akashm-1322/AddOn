import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config';
import logger from './logger';
import { authRouter } from './routes/auth.routes';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';

async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Mongo connection error', err);
    process.exit(1);
  }

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(globalRateLimiter);

  app.use('/auth', authRouter);

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.listen(config.port, () => logger.info(`Auth service listening on ${config.port}`));
}

bootstrap();
