const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database/config');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with joins
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        departments:department_id(name),
        positions:position_id(name)
      `)
      .eq('email', email)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Format response
    const userResponse = {
      id: user.id,
      nip: user.nip,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      department_id: user.department_id,
      position_id: user.position_id,
      role: user.role,
      status: user.status,
      photo: user.photo,
      department_name: user.departments?.name || null,
      position_name: user.positions?.name || null
    };

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, nip, name, email, phone, address,
        department_id, position_id, role, photo, status,
        departments:department_id(name),
        positions:position_id(name)
      `)
      .eq('id', req.user.id)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    const user = users[0];
    const userResponse = {
      ...user,
      department_name: user.departments?.name || null,
      position_name: user.positions?.name || null
    };
    delete userResponse.departments;
    delete userResponse.positions;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('users')
      .update({ name, phone, address })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profile berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current password
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .limit(1);

    if (fetchError) throw fetchError;

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, users[0].password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
