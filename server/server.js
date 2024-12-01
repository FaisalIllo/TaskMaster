const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');

const app = express();

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URL;
mongoose
  .connect(MONGO_URI )
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5500', 'http://127.0.0.1:5500', ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Export the app for Vercel
module.exports = app;
