require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agent');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'PlaCIQ 2.0 Operational', version: '2.0.0', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const MONGO_URI = process.env.MONGO_URI || '';
const PORT = process.env.PORT || 5000;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Atlas connected');
      httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
    })
    .catch(err => {
      console.error('MongoDB error:', err.message);
      httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT} (no DB)`));
    });
} else {
  httpServer.listen(PORT, () => console.log(`🚀 PlaCIQ 2.0 running on port ${PORT}`));
}
