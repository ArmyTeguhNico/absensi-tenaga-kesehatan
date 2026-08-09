const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// User routes
router.post('/check-in', verifyToken, attendanceController.checkIn);
router.post('/check-out', verifyToken, attendanceController.checkOut);
router.get('/today', verifyToken, attendanceController.getTodayAttendance);
router.get('/history', verifyToken, attendanceController.getAttendanceHistory);

// Admin routes
router.get('/all', verifyToken, isAdmin, attendanceController.getAllAttendance);
router.get('/stats', verifyToken, isAdmin, attendanceController.getAttendanceStats);

module.exports = router;
