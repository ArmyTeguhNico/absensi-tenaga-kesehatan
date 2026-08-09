const express = require('express');
const router = express.Router();
const rfidFaceController = require('../controllers/rfidFaceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// RFID Endpoints
router.post('/rfid/register', verifyToken, isAdmin, rfidFaceController.registerRFID);
router.post('/rfid/verify', rfidFaceController.verifyRFID); // Public untuk device
router.delete('/rfid/:userId', verifyToken, isAdmin, rfidFaceController.deleteRFID);

// Face Recognition Endpoints
router.post('/face/upload/:userId', verifyToken, rfidFaceController.uploadFacePhotos);
router.post('/face/embeddings/:userId', verifyToken, rfidFaceController.storeFaceEmbeddings);
router.delete('/face/:userId', verifyToken, isAdmin, rfidFaceController.deleteFaceData);

// Status
router.get('/status/:userId', verifyToken, rfidFaceController.getUserRFIDFaceStatus);

module.exports = router;
