const supabase = require('../database/config');
const multer = require('multer');
const path = require('path');

// Register RFID Card
exports.registerRFID = async (req, res) => {
  try {
    const { userId, rfidUid } = req.body;

    // Check if RFID already registered to another user
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, name')
      .eq('rfid_uid', rfidUid)
      .neq('id', userId)
      .limit(1);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `RFID Card sudah terdaftar untuk ${existing[0].name}`
      });
    }

    // Register RFID
    const { error: updateError } = await supabase
      .from('users')
      .update({
        rfid_uid: rfidUid,
        rfid_registered_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'RFID Card berhasil didaftarkan',
      data: {
        rfid_uid: rfidUid,
        registered_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Register RFID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Upload Face Photos for Training
exports.uploadFacePhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const { faceData, photoUrl } = req.body; // Base64 or URL

    // Get current face photos
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('face_photos')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Append new photo
    const currentPhotos = user.face_photos || [];
    const updatedPhotos = [...currentPhotos, photoUrl];

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        face_photos: updatedPhotos,
        face_data: faceData,
        face_registered_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: `Foto wajah berhasil ditambahkan (${updatedPhotos.length} foto)`,
      data: {
        total_photos: updatedPhotos.length,
        face_registered: true
      }
    });
  } catch (error) {
    console.error('Upload face photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get User RFID & Face Status
exports.getUserRFIDFaceStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('rfid_uid, rfid_registered_at, face_data, face_registered_at, face_photos')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        rfid: {
          registered: !!user.rfid_uid,
          uid: user.rfid_uid || null,
          registered_at: user.rfid_registered_at
        },
        face: {
          registered: !!user.face_data,
          photos_count: user.face_photos?.length || 0,
          registered_at: user.face_registered_at
        }
      }
    });
  } catch (error) {
    console.error('Get RFID Face status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Verify RFID for Attendance
exports.verifyRFID = async (req, res) => {
  try {
    const { rfidUid } = req.body;

    const { data: users, error } = await supabase
      .from('users')
      .select('id, nip, name, email, photo, department_id, position_id')
      .eq('rfid_uid', rfidUid)
      .eq('status', 'active')
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'RFID Card tidak terdaftar'
      });
    }

    res.json({
      success: true,
      message: 'RFID Card terverifikasi',
      data: users[0]
    });
  } catch (error) {
    console.error('Verify RFID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Store Face Embeddings (untuk face recognition model)
exports.storeFaceEmbeddings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { embeddings } = req.body; // JSON array dari face-api.js atau model lain

    const { error } = await supabase
      .from('users')
      .update({
        face_embeddings: JSON.stringify(embeddings)
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Face embeddings berhasil disimpan'
    });
  } catch (error) {
    console.error('Store face embeddings error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Delete RFID Registration
exports.deleteRFID = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .update({
        rfid_uid: null,
        rfid_registered_at: null
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'RFID Card berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete RFID error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Delete Face Data
exports.deleteFaceData = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .update({
        face_data: null,
        face_photos: null,
        face_embeddings: null,
        face_registered_at: null
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Data wajah berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete face data error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
