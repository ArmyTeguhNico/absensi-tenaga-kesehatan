const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { leaveValidation } = require('../middleware/validator');

// User routes
router.post('/', verifyToken, leaveValidation, leaveController.submitLeave);
router.get('/my-leaves', verifyToken, leaveController.getMyLeaves);

// Admin routes
router.get('/all', verifyToken, isAdmin, leaveController.getAllLeaves);
router.put('/:id/process', verifyToken, isAdmin, leaveController.processLeave);

module.exports = router;
