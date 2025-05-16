const express = require('express');
const router = express.Router();
const encryptUploadController = require('../controllers/encryptUploadController');

/**
 * @route   POST /api/encrypt-upload
 * @desc    Encrypt and upload a file
 * @access  Public (add authentication middleware as needed)
 */
router.post('/', encryptUploadController.encryptAndUpload);


module.exports = router;