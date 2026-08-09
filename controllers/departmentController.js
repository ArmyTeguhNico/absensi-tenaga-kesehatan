const db = require('../database/config');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get all departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get all positions
exports.getAllPositions = async (req, res) => {
  try {
    const [positions] = await db.query('SELECT * FROM positions ORDER BY name ASC');
    
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Get all positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create department (Admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const [result] = await db.query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Departemen berhasil dibuat',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Create position (Admin only)
exports.createPosition = async (req, res) => {
  try {
    const { name, description } = req.body;

    const [result] = await db.query(
      'INSERT INTO positions (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Jabatan berhasil dibuat',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
