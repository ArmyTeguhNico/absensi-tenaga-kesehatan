const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public routes (no auth required for GET - for registration forms)
router.get('/departments', departmentController.getAllDepartments);
router.get('/positions', departmentController.getAllPositions);

// Admin only routes
router.post('/departments', verifyToken, isAdmin, departmentController.createDepartment);
router.post('/positions', verifyToken, isAdmin, departmentController.createPosition);

module.exports = router;
