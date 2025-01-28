const fs = require('fs');
const pdf = require('pdf-parse');
const ScoringUtilService = require('../utils/scoringUtils');

/**
 * Service to handle resume upload and ATS score calculation.
 */
class ResumeService {
    /**
     * Extract text from the uploaded resume file.
     * @param {string} filePath - Path to the uploaded file.
     * @returns {Promise<string>} - Extracted text from the resume.
     */
    static async extractTextFromResume(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            throw new Error('Failed to extract text from the resume.');
        }
    }

    /**
     * Calculate the ATS score for the resume.
     * @param {string} resumeText - Extracted text from the resume.
     * @param {string} jobDescription - Job description text.
     * @returns {Promise<object>} - ATS score and its breakdown.
     */
    static async calculateATS(resumeText, jobDescription) {
        if (!resumeText || !jobDescription) {
            throw new Error('Resume text and job description are required.');
        }
        
        try {
            // console.log("resumeText resumeText resumeText", resumeText);
            // console.log("jobDescription jobDescription jobDescription", jobDescription);
            const atsScore = await ScoringUtilService.calculateATSScore(resumeText, jobDescription);
            console.log("atsScore atsScore atsScore", atsScore);
            return atsScore;
        } catch (error) {
            console.log("error error error", error);
            throw new Error('Failed to calculate ATS score.');
        }
    }
}

module.exports = ResumeService;