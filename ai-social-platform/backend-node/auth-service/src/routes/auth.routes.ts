import express from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { createLimiter } from '../middleware/rateLimiter.middleware';

export const authRouter = express.Router();

// Register
authRouter.post(
  '/register',
  createLimiter({ windowMs: 60 * 1000, max: 5 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const user = await AuthService.registerByEmail(req.body);
      res.status(201).json({ userId: user._id });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Email verification
authRouter.get('/verify-email', async (req, res) => {
  const token = req.query.token as string;
  try {
    await AuthService.verifyEmail(token);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Login with password
authRouter.post(
  '/login',
  createLimiter({ windowMs: 60 * 1000, max: 10 }),
  body('email').isEmail(),
  body('password').isString(),
  async (req, res) => {
    try {
      const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] };
      const result = await AuthService.loginWithPassword({ ...req.body, deviceInfo });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Refresh token
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await AuthService.refreshToken({ refreshToken, deviceInfo });
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

// Logout
authRouter.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// OTP: request and verify
authRouter.post('/otp/request', createLimiter({ windowMs: 60 * 1000, max: 5 }), async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'phone required' });
  try {
    await AuthService.requestOtp(phone);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await AuthService.verifyOtp(phone, otp, deviceInfo);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Google login (accept idToken from client)
authRouter.post('/google', createLimiter({ windowMs: 60 * 1000, max: 10 }), async (req, res) => {
  const { idToken } = req.body;
  try {
    const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const result = await AuthService.loginWithGoogle(idToken, deviceInfo);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Forgot / reset password
authRouter.post('/password/forgot', createLimiter({ windowMs: 60 * 1000, max: 5 }), async (req, res) => {
  const { email } = req.body;
  try {
    await AuthService.forgotPassword(email);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post('/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await AuthService.resetPassword(token, newPassword);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Sessions & device management
authRouter.get('/sessions', authMiddleware, async (req: any, res) => {
  try {
    const sessions = await AuthService.listSessions(req.user._id.toString());
    res.json({ sessions });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post('/sessions/revoke', authMiddleware, async (req: any, res) => {
  const { tokenId } = req.body;
  try {
    await AuthService.revokeSession(tokenId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});
