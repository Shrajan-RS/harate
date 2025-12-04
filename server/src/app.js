const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { configureCloudinary } = require('./utils/cloudinary');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

configureCloudinary();

const allowedOrigins =
  (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || [];

if (!allowedOrigins.length) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error', err.message);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong',
  });
});

module.exports = app;

