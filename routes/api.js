const express = require('express');
const upload = require('../config/multerConfig'); // Multer configuration for file uploads
const evaluationController = require('../controllers/evaluationController');

const router = express.Router();

// POST endpoint for uploading a resume and calculating the ATS score
router.post('/upload-resume', upload.single('resume'), evaluationController.uploadResume);
// payload: resume, jobDescription


// Route for uploading resumes and calculating ATS score
router.post('/upload-resume-with-diff', upload.single('resume'), evaluationController.uploadResumeWithDiff);// payload resume only


module.exports = router;