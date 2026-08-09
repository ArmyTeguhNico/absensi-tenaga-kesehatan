const jwt = require('jsonwebtoken');
const supabase = require('../database/config');

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, nip, name, email, role, department_id, position_id, status')
      .eq('id', decoded.userId)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    if (users[0].status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda tidak aktif'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa. Silakan login kembali.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
