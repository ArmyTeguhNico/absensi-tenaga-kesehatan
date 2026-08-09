// Netlify Functions - Main API Handler
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('../../routes/authRoutes');
const userRoutes = require('../../routes/userRoutes');
const attendanceRoutes = require('../../routes/attendanceRoutes');
const leaveRoutes = require('../../routes/leaveRoutes');
const departmentRoutes = require('../../routes/departmentRoutes');
const rfidFaceRoutes = require('../../routes/rfidFaceRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://absensitenkes.netlify.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api', departmentRoutes);
app.use('/api/rfid-face', rfidFaceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Netlify Functions API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Export as serverless function
module.exports.handler = serverless(app);
