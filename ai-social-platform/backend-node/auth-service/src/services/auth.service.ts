import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { generateOtp, hashOtp } from '../utils/otp.util';
import { sendSMS, sendEmail } from '../utils/email.util';
import config from '../config';
import Redis from 'ioredis';
import bcrypt from 'bcrypt';
import { signAccessToken, signRefreshToken, hashToken } from '../utils/jwt';
import { verifyIdToken } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(config.redisUrl);

export const AuthService = {
  async registerByEmail({ email, password, name }: { email: string; password: string; name?: string }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) throw new Error('Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({ email, passwordHash, name });

    // create email verification token
    const token = uuidv4();
    await redis.set(`email_verify:${token}`, user._id.toString(), 'EX', 60 * 60 * 24);
    const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    await sendEmail(email, 'Verify your email', `Click to verify: ${verifyUrl}`);
    return user;
  },

  async verifyEmail(token: string) {
    const userId = await redis.get(`email_verify:${token}`);
    if (!userId) throw new Error('Invalid or expired token');
    await UserRepository.updateEmailVerified(userId, true);
    await redis.del(`email_verify:${token}`);
    return true;
  },

  async loginWithPassword({ email, password, deviceInfo, ip, userAgent }: any) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.passwordHash) throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');

    const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });
    const refresh = signRefreshToken({ sub: user._id.toString() });
    const refreshHash = hashToken(refresh);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days fallback
    await TokenRepository.create({ userId: user._id, tokenHash: refreshHash, deviceInfo, ip, userAgent, expiresAt });
    return { user, accessToken, refreshToken: refresh };
  },

  async refreshToken({ refreshToken, deviceInfo, ip, userAgent }: any) {
    try {
      const payload: any = await (await import('jsonwebtoken')).verify(refreshToken, config.jwtRefreshSecret);
      const refreshHash = hashToken(refreshToken);
      const tokenDoc: any = await TokenRepository.findByHash(refreshHash);
      if (!tokenDoc || tokenDoc.revoked) throw new Error('Invalid refresh token');
      // issue new access token
      const accessToken = signAccessToken({ sub: tokenDoc.userId.toString(), roles: tokenDoc.userId.roles });
      return { accessToken };
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  },

  async requestOtp(phone: string) {
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    await redis.set(`otp:${phone}`, otpHash, 'EX', config.otpTtlSeconds);
    await sendSMS(phone, `Your login OTP is ${otp}. It expires in ${config.otpTtlSeconds / 60} minutes.`);
    return true;
  },

  async verifyOtp(phone: string, otp: string, deviceInfo: any) {
    const otpHash = await redis.get(`otp:${phone}`);
    if (!otpHash) throw new Error('OTP expired');
    const providedHash = hashOtp(otp);
    if (providedHash !== otpHash) throw new Error('Invalid OTP');
    await redis.del(`otp:${phone}`);

    // find or create user
    let user = await UserRepository.findByPhone(phone);
    if (!user) {
      user = await UserRepository.create({ phone });
    }
    const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });
    const refresh = signRefreshToken({ sub: user._id.toString() });
    const refreshHash = hashToken(refresh);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await TokenRepository.create({ userId: user._id, tokenHash: refreshHash, deviceInfo });
    return { user, accessToken, refreshToken: refresh };
  },

  async loginWithGoogle(idToken: string, deviceInfo: any) {
    // Verify id token with Google
    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(config.googleClientId);
    const ticket = await client.verifyIdToken({ idToken, audience: config.googleClientId });
    const payload: any = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    if (!email) throw new Error('Google token did not contain email');
    const user = await UserRepository.findOrCreateByGoogle({ email, name });
    const accessToken = signAccessToken({ sub: user._id.toString(), roles: user.roles });
    const refresh = signRefreshToken({ sub: user._id.toString() });
    const refreshHash = hashToken(refresh);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await TokenRepository.create({ userId: user._id, tokenHash: refreshHash, deviceInfo });
    return { user, accessToken, refreshToken: refresh };
  },

  async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) return true; // don't reveal
    const token = uuidv4();
    await redis.set(`pwd_reset:${token}`, user._id.toString(), 'EX', 60 * 60);
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    await sendEmail(email, 'Password reset', `Reset here: ${resetUrl}`);
    return true;
  },

  async resetPassword(token: string, newPassword: string) {
    const userId = await redis.get(`pwd_reset:${token}`);
    if (!userId) throw new Error('Invalid or expired token');
    const hash = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hash);
    await redis.del(`pwd_reset:${token}`);
    return true;
  },

  async listSessions(userId: string) {
    return TokenRepository.listForUser(userId);
  },

  async revokeSession(tokenId: string) {
    return TokenRepository.revoke(tokenId);
  },

  async logout(refreshToken: string) {
    const refreshHash = hashToken(refreshToken);
    const tokenDoc: any = await TokenRepository.findByHash(refreshHash);
    if (tokenDoc) {
      await TokenRepository.revoke(tokenDoc._id);
    }
    return true;
  },
};
