const fs = require('fs');
const path = require('path');
const ResumeService = require('../services/resumeService');

const evaluationController = {
  uploadResume: async (req, res) => {
    // console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa')
    // console.log('Request file:', req.file);
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      // Step 1: Extract text from the uploaded resume
      const resumeText = await ResumeService.extractTextFromResume(req.file.path);

      // Step 2: Get the job description from the request body
      const { jobDescription } = req.body;
      if (!jobDescription) {
        throw new Error('Job description is required.');
      }
      // console.log('Job description:', jobDescription);
      // Step 3: Calculate the ATS score
      const atsScore = await ResumeService.calculateATS(resumeText, jobDescription);

      // Step 4: Send the response
      res.json({ atsScore });
    } catch (error) {
      console.error('Error processing resume:', error);
      res.status(500).json({ error: error.message || 'An error occurred while processing the resume.' });
    } finally {
      // Step 5: Clean up the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  },
};

module.exports = evaluationController;