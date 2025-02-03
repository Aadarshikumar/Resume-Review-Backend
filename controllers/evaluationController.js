const fs = require('fs');
const path = require('path');
const ResumeService = require('../services/resumeService');
const AtsScoreForDifferentTypeResumes = require('../utils/atsScoreForDifferentTypeResumes');

const evaluationController = {
  uploadResume: async (req, res) => {
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


  // Create a functions that will handle the resumes with format pdf, docx, doc and return the extracted text
  uploadResumeWithDiff: async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      // Step 1: Extract text from the uploaded resume
      const resumeText = await ResumeService.extractTextFromResumeWithDiff(req.file.path);

      // call the function send the resumeText as a parameter 
      const atsScore = await AtsScoreForDifferentTypeResumes.calculateATSForDiffResume(resumeText);

      // console.log('atsScore:', atsScore);
      // Step 2: Send the response
      // res.json({ resumeText });
      res.json({ atsScore });
    } catch (error) {
      console.error('Error processing resume:', error);
      res.status(500).json({ error: error.message || 'An error occurred while processing the resume.' });
    } finally {
      // Step 3: Clean up the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  }


};



module.exports = evaluationController;