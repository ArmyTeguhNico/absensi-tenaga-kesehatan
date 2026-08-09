const bcrypt = require('bcryptjs');
const db = require('../database/config');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { department_id, position_id, status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.nip, u.name, u.email, u.phone, u.address, 
             u.department_id, u.position_id, u.role, u.status, u.photo,
             d.name as department_name, p.name as position_name, u.created_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN positions p ON u.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    if (position_id) {
      query += ' AND u.position_id = ?';
      params.push(position_id);
    }

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.nip LIKE ? OR u.email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const countParams = [];

    if (department_id) {
      countQuery += ' AND u.department_id = ?';
      countParams.push(department_id);
    }
    if (position_id) {
      countQuery += ' AND u.position_id = ?';
      countParams.push(position_id);
    }
    if (status) {
      countQuery += ' AND u.status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (u.name LIKE ? OR u.nip LIKE ? OR u.email LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(`
      SELECT u.id, u.nip, u.name, u.email, u.phone, u.address, 
             u.department_id, u.position_id, u.role, u.status, u.photo,
             d.name as department_name, p.name as position_name, u.created_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN positions p ON u.position_id = p.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { nip, name, email, password, phone, address, department_id, position_id, role, status } = req.body;

    // Check if NIP or email already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE nip = ? OR email = ?',
      [nip, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'NIP atau email sudah terdaftar'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (nip, name, email, password, phone, address, department_id, position_id, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nip, name, email, hashedPassword, phone, address, department_id, position_id, role || 'user', status || 'active']
    );

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, name, email, phone, address, department_id, position_id, role, status } = req.body;

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check if NIP or email already used by other user
    const [existing] = await db.query(
      'SELECT id FROM users WHERE (nip = ? OR email = ?) AND id != ?',
      [nip, email, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'NIP atau email sudah digunakan oleh user lain'
      });
    }

    // Update user
    await db.query(
      `UPDATE users SET nip = ?, name = ?, email = ?, phone = ?, address = ?, 
       department_id = ?, position_id = ?, role = ?, status = ? WHERE id = ?`,
      [nip, name, email, phone, address, department_id, position_id, role, status, id]
    );

    res.json({
      success: true,
      message: 'User berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Reset password (Admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
