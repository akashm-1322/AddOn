const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.CHAT_PORT || 5001;
app.use(cors());
app.get('/health', (req, res) => res.json({ ok: true, service: 'chat-service' }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('chat client connected', socket.id);
  socket.on('join', ({ room }) => {
    socket.join(room);
    io.to(room).emit('system', { message: `${socket.id} joined ${room}` });
  });
  socket.on('message', (msg) => {
    if (msg.room) io.to(msg.room).emit('message', { ...msg, from: socket.id, ts: Date.now() });
  });
  socket.on('disconnect', () => console.log('chat client disconnected', socket.id));
});

server.listen(PORT, () => console.log(`chat-service listening on ${PORT}`));
