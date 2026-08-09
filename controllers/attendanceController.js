const db = require('../database/config');

// Check in (Absen Masuk)
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes, location } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check if already checked in today
    const [existing] = await db.query(
      'SELECT id, check_in FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.length > 0 && existing[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah melakukan absen masuk hari ini'
      });
    }

    // Insert or update attendance
    if (existing.length > 0) {
      await db.query(
        'UPDATE attendance SET check_in = ?, location_in = ?, notes = ? WHERE id = ?',
        [now, location, notes, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO attendance (user_id, date, check_in, location_in, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, today, now, location, notes, 'hadir']
      );
    }

    res.json({
      success: true,
      message: 'Absen masuk berhasil',
      data: {
        date: today,
        check_in: now
      }
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Check out (Absen Pulang)
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notes, location } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check if checked in today
    const [existing] = await db.query(
      'SELECT id, check_in, check_out FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existing.length === 0 || !existing[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Anda belum melakukan absen masuk hari ini'
      });
    }

    if (existing[0].check_out) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah melakukan absen pulang hari ini'
      });
    }

    // Update check out
    await db.query(
      'UPDATE attendance SET check_out = ?, location_out = ?, notes = CONCAT(COALESCE(notes, ""), " | ", ?) WHERE id = ?',
      [now, location, notes || '', existing[0].id]
    );

    res.json({
      success: true,
      message: 'Absen pulang berhasil',
      data: {
        date: today,
        check_out: now
      }
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get today's attendance
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [attendance] = await db.query(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    res.json({
      success: true,
      data: attendance.length > 0 ? attendance[0] : null
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM attendance WHERE user_id = ?';
    const params = [userId];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [attendance] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM attendance WHERE user_id = ?';
    const countParams = [userId];
    if (startDate && endDate) {
      countQuery += ' AND date BETWEEN ? AND ?';
      countParams.push(startDate, endDate);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get all attendance (Admin only)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, department_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.nip, u.name, u.email, d.name as department_name, p.name as position_name
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN positions p ON u.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.date DESC, a.check_in DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [attendance] = await db.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM attendance a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];

    if (date) {
      countQuery += ' AND a.date = ?';
      countParams.push(date);
    }
    if (department_id) {
      countQuery += ' AND u.department_id = ?';
      countParams.push(department_id);
    }
    if (status) {
      countQuery += ' AND a.status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const [stats] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM attendance
      WHERE MONTH(date) = ? AND YEAR(date) = ?
      GROUP BY status
    `, [currentMonth, currentYear]);

    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');

    res.json({
      success: true,
      data: {
        stats,
        totalUsers: totalUsers[0].total,
        month: currentMonth,
        year: currentYear
      }
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
