const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes (all authenticated users can view)
router.get('/departments', verifyToken, departmentController.getAllDepartments);
router.get('/positions', verifyToken, departmentController.getAllPositions);

// Admin only routes
router.post('/departments', verifyToken, isAdmin, departmentController.createDepartment);
router.post('/positions', verifyToken, isAdmin, departmentController.createPosition);

module.exports = router;
