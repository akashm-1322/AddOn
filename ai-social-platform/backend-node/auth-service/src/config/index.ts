import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/authdb',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
  accessTokenExp: process.env.ACCESS_TOKEN_EXP || '15m',
  refreshTokenExp: process.env.REFRESH_TOKEN_EXP || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  emailFrom: process.env.EMAIL_FROM || 'no-reply@example.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  otpTtlSeconds: parseInt(process.env.OTP_TTL_SECONDS || '300', 10),
};
