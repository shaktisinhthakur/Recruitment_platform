const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Single file upload with field name 'jd'
router.post('/jd', uploadController.upload.single('jd'), uploadController.extractText);
router.post('/jd/create-job', uploadController.upload.single('jd'), uploadController.uploadAndCreateJob);

module.exports = router;