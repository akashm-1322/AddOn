const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.GATEWAY_PORT || 8080;

app.use(cors());
app.use(express.json());

// Proxy auth routes to auth-service
app.use('/v1/auth', createProxyMiddleware({ target: 'http://auth-service:4001', changeOrigin: true }));

app.get('/health', (req, res) => res.json({ ok: true, service: 'gateway' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  socket.on('join', ({ room }) => {
    socket.join(room);
  });
  socket.on('message', (msg) => {
    // Broadcast to room
    if (msg.room) io.to(msg.room).emit('message', { ...msg, ts: Date.now() });
  });
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

server.listen(PORT, () => console.log(`gateway listening on ${PORT}`));
