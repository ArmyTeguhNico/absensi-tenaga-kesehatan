const supabase = require('../database/config');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: departments || []
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
    const { data: positions, error } = await supabase
      .from('positions')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: positions || []
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

    const { data, error } = await supabase
      .from('departments')
      .insert([{ name, description }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Departemen berhasil dibuat',
      data: data[0]
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

    const { data, error } = await supabase
      .from('positions')
      .insert([{ name, description }])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Jabatan berhasil dibuat',
      data: data[0]
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
