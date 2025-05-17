const express = require('express');
const router = express.Router();
const didController = require('../controllers/didController');

// Route to create a DID
router.post('/create', didController.createDID);

module.exports = router;