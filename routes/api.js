const express = require('express');
const upload = require('../config/multerConfig'); // Multer configuration for file uploads
const evaluationController = require('../controllers/evaluationController');

const router = express.Router();

// POST endpoint for uploading a resume and calculating the ATS score
router.post('/upload-resume', upload.single('resume'), evaluationController.uploadResume);
// payload: resume, jobDescription

module.exports = router;