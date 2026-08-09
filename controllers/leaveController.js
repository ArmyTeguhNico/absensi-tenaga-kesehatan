const db = require('../database/config');

// Submit leave request
exports.submitLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leave_type, start_date, end_date, reason } = req.body;

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai'
      });
    }

    // Insert leave request
    const [result] = await db.query(
      'INSERT INTO leaves (user_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
      [userId, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Pengajuan izin berhasil disubmit',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Submit leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get my leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM leaves WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [leaves] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM leaves WHERE user_id = ?';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get all leaves (Admin only)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, leave_type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, u.nip, u.name, u.email, d.name as department_name,
             approver.name as approved_by_name
      FROM leaves l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users approver ON l.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (leave_type) {
      query += ' AND l.leave_type = ?';
      params.push(leave_type);
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [leaves] = await db.query(query, params);

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Approve/Reject leave (Admin only)
exports.processLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status harus approved atau rejected'
      });
    }

    // Check if leave exists
    const [leaves] = await db.query('SELECT * FROM leaves WHERE id = ?', [id]);
    if (leaves.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan izin tidak ditemukan'
      });
    }

    // Update leave status
    await db.query(
      'UPDATE leaves SET status = ?, approved_by = ?, approved_at = NOW(), notes = ? WHERE id = ?',
      [status, adminId, notes, id]
    );

    res.json({
      success: true,
      message: `Pengajuan izin berhasil di${status === 'approved' ? 'setujui' : 'tolak'}`
    });
  } catch (error) {
    console.error('Process leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
