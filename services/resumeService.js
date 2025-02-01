const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');
const { exec } = require('child_process');


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
            const data = await pdfParse(dataBuffer);
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

    //----------------------------------------------------------------------------------------------------------------------------------


    static async extractTextFromResumeWithDiff(filePath) {
        const fileExtension = filePath.split('.').pop().toLowerCase();

        try {
            let text;

            switch (fileExtension) {
                case 'pdf':
                    text = await this.extractTextFromPDF(filePath);
                    break;
                case 'docx':
                    text = await this.extractTextFromDOCX(filePath);
                    break;
                case 'doc':
                    text = await this.extractTextFromDOC(filePath);
                    break;
                default:
                    throw new Error('Unsupported file format');
            }

            return text;
        } catch (error) {
            console.error('Error extracting text from resume:', error);
            throw new Error(`Error extracting text from resume: ${error.message}`);
        }
    }

    static async extractTextFromPDF(filePath) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }

    static async extractTextFromDOCX(filePath) {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }

    static async extractTextFromDOC(filePath) {
        try {
            // Check if the file is actually a DOCX file
            const isZip = await this.isZipFile(filePath);
            if (isZip) {
                // Handle as DOCX file
                return await this.extractTextFromDOCX(filePath);
            } else {
                // Handle as binary DOC file using antiword
                return new Promise((resolve, reject) => {
                    exec(`antiword "${filePath}"`, (error, stdout, stderr) => {
                        if (error) {
                            console.error('Antiword Error:', error);
                            reject(error);
                        } else {
                            resolve(stdout);
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error extracting text from DOC file:', error);
            throw new Error(`Error extracting text from DOC file: ${error.message}`);
        }
    }

    static async isZipFile(filePath) {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(filePath, { start: 0, end: 3 });
            fileStream.on('data', (chunk) => {
                const magicNumber = chunk.toString('hex');
                resolve(magicNumber === '504b0304'); // ZIP file magic number
            });
            fileStream.on('error', (error) => {
                reject(error);
            });
        });
    }
}




module.exports = ResumeService;