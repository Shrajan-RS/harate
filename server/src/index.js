require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const socketOrigins =
  (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || [];

if (!socketOrigins.length) {
  socketOrigins.push('http://localhost:5173');
}

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    credentials: true,
  },
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    if (!userData?.id) return;
    onlineUsers.set(userData.id, socket.id);
    socket.join(userData.id);
    io.emit('user_online', userData.id);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('typing', { chatId, userId });
  });

  socket.on('stop_typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('stop_typing', { chatId, userId });
  });

  socket.on('new_message', (message) => {
    if (!message?.chat?.users) return;

    const chatId = message.chat.id || message.chat._id;

    message.chat.users.forEach((user) => {
      const userId = user.id || user._id;
      const senderId = message.sender?.id || message.sender?._id;
      if (!userId || userId === senderId) return;
      socket.to(userId).emit('message_received', message);
    });
    if (chatId) {
      socket.to(chatId).emit('message_received', message);
    }
  });

  socket.on('disconnecting', async () => {
    const userId = [...onlineUsers.entries()].find(
      ([, value]) => value === socket.id,
    )?.[0];

    if (userId) {
      onlineUsers.delete(userId);
      io.emit('user_offline', userId);
      await User.findByIdAndUpdate(userId, { lastSeen: Date.now() });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

