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
    'https://absensitenkesrs.netlify.app',
    'https://absensitenkes.netlify.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - Remove /api prefix since it's already in the URL path
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/leaves', leaveRoutes);
app.use('/', departmentRoutes);
app.use('/rfid-face', rfidFaceRoutes);

// Health check - at root of function
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Netlify Functions API is running',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET (' + process.env.SUPABASE_URL.substring(0, 20) + '...)' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'MISSING',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_KEY.length + ')' : 'MISSING'
    }
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
