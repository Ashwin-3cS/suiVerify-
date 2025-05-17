const express = require('express');
const router = express.Router();
const multer = require('multer');
const encryptUploadController = require('../controllers/encryptUploadController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * @route   POST /api/encrypt-upload
 * @desc    Encrypt and upload a file
 * @access  Public (add authentication middleware as needed)
 */
// Use any() to accept any field name for file uploads
router.post('/', upload.any(), encryptUploadController.encryptAndUpload);

module.exports = router;