const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.AUTH_PORT || 4001;
const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'dev_secret';

app.use(cors());
app.use(bodyParser.json());

// Health
app.get('/health', (req, res) => res.json({ ok: true, service: 'auth-service' }));

// Stub: Google login (accepts id_token and returns JWT)
app.post('/v1/auth/google', (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: 'id_token required (stub)' });
  // In production: verify with Google API and provision user
  const user = { id: uuidv4(), email: `user+${Math.floor(Math.random()*1000)}@example.com`, name: 'Google User' };
  const access_token = jwt.sign({ sub: user.id, email: user.email, roles: ['user'] }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' });
  const refresh_token = jwt.sign({ sub: user.id }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '30d' });
  res.json({ access_token, refresh_token, user });
});

// Stub: OTP request
app.post('/v1/auth/otp/request', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  // In prod: send SMS via Twilio and store request
  res.json({ request_id: uuidv4(), phone });
});

// Stub: OTP verify
app.post('/v1/auth/otp/verify', (req, res) => {
  const { request_id, code } = req.body;
  if (!request_id || !code) return res.status(400).json({ error: 'missing' });
  const user = { id: uuidv4(), phone: 'stub' };
  const access_token = jwt.sign({ sub: user.id, roles: ['user'] }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' });
  const refresh_token = jwt.sign({ sub: user.id }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '30d' });
  res.json({ access_token, refresh_token, user });
});

// Token refresh
app.post('/v1/auth/token/refresh', (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });
  try {
    const decoded = jwt.verify(refresh_token, JWT_SECRET);
    const access_token = jwt.sign({ sub: decoded.sub, roles: ['user'] }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' });
    res.json({ access_token, refresh_token });
  } catch (err) {
    return res.status(401).json({ error: 'invalid_refresh' });
  }
});

// Me endpoint
app.get('/v1/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.sub, email: decoded.email || null, roles: decoded.roles || ['user'] });
  } catch (err) {
    res.status(401).json({ error: 'invalid_token' });
  }
});

app.listen(PORT, () => console.log(`auth-service listening on ${PORT}`));
