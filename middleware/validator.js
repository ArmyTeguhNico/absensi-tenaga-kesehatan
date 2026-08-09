const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array()
    });
  }
  next();
};

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password harus diisi'),
  validate
];

// User registration validation
const registerValidation = [
  body('nip').notEmpty().withMessage('NIP harus diisi'),
  body('name').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('phone').optional().isMobilePhone('id-ID').withMessage('Nomor telepon tidak valid'),
  validate
];

// Attendance validation
const attendanceValidation = [
  body('status')
    .optional()
    .isIn(['hadir', 'izin', 'sakit', 'alpha', 'cuti'])
    .withMessage('Status tidak valid'),
  validate
];

// Leave validation
const leaveValidation = [
  body('leave_type')
    .isIn(['cuti', 'izin', 'sakit'])
    .withMessage('Tipe izin tidak valid'),
  body('start_date').isDate().withMessage('Tanggal mulai tidak valid'),
  body('end_date').isDate().withMessage('Tanggal selesai tidak valid'),
  body('reason').notEmpty().withMessage('Alasan harus diisi'),
  validate
];

module.exports = {
  loginValidation,
  registerValidation,
  attendanceValidation,
  leaveValidation
};
