const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

class AtsScoreForDifferentTypeResumes {
    static resumeKeywords = [
        'experience', 'education', 'skills', 'work', 'project', 'summary',
        'employment', 'certification', 'achievement', 'objective', 'contact',
        'phone', 'email', 'linkedin', 'github', 'portfolio'
    ];

    static sectionHeaders = [
        'work experience', 'education', 'skills', 'projects', 'summary',
        'employment history', 'certifications', 'achievements', 'objective',
        'contact information'
    ];

    static dateFormats = [
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/g,
        /\b\d{4}\s*-\s*\d{4}\b/g,
        /\b\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{4}\b/g
    ];

    static contactInfoPatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone number
        /linkedin\.com\/in\/[A-Za-z0-9-]+\b/, // LinkedIn profile
        /github\.com\/[A-Za-z0-9-]+\b/ // GitHub profile
    ];

    static async isResumeLike(resumeText) {
        const lowerCaseResumeText = resumeText.toLowerCase();

        // Check for presence of resume keywords
        const hasKeywords = this.resumeKeywords.some(keyword => lowerCaseResumeText.includes(keyword));

        // Check for common section headers
        const hasSectionHeaders = this.sectionHeaders.some(header => lowerCaseResumeText.includes(header));

        // Check for date formats
        const hasDateFormats = this.dateFormats.some(format => format.test(lowerCaseResumeText));

        // Check for contact information
        const hasContactInfo = this.contactInfoPatterns.some(pattern => pattern.test(resumeText));

        // Check for bullet points
        const hasBulletPoints = (resumeText.match(/•||\*|\-/g) || []).length > 5;

        return hasKeywords || hasSectionHeaders || hasDateFormats || hasContactInfo || hasBulletPoints;
    }

    static async calculateATSForDiffResume(resumeText) {
        try {
            // Step 0: Validate if the resumeText is empty or doesn't resemble a resume
            if (!resumeText || resumeText.trim().length === 0) {
                throw new Error('The uploaded document is empty.');                
            }

            // Enhanced heuristic to check if the text resembles a resume
            if (!(await this.isResumeLike(resumeText))) {
                return {
                    analysis: {
                        atsScore: 40, // Set a low score for non-resume documents
                        strengths: [],
                        improvements: ['NA - The document does not resemble a resume.'],
                    },
                    enhancedSections: 'NA - The document does not resemble a resume.',
                };
            }

            // Step 1: Use OpenRouter API to analyze the resume text and generate ATS score, strengths, and improvements
            const analysisResponse = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Analyze the following resume text and provide:
                                                1. An overall ATS score out of 100, considering factors like experience, education, skills, readability, and formatting.
                                                2. 3 strengths of the resume.
                                                3. 3 improvement areas for the resume.
    
                                            Return the result in JSON format with keys "atsScore", "strengths", and "improvements".
    
                                            Resume Text:\n\n${resumeText}`,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.5, // Adjust temperature for more nuanced output
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'Resume Review Backend',
                    },
                }
            );


            // Check if the API returned an error
            if (analysisResponse.data.error) {
                throw new Error(`OpenRouter API Error: ${analysisResponse.data.error.message}`);
            }

            // Ensure the response contains the expected data
            if (!analysisResponse.data.choices || !analysisResponse.data.choices[0] || !analysisResponse.data.choices[0].message) {
                throw new Error('Invalid response from OpenRouter API: Missing choices or message.');
            }

            const analysisContent = analysisResponse.data.choices[0].message.content.trim();
            const analysisResult = JSON.parse(analysisContent);

            // Optional: Post-process the score for more variability
            const scaledScore = analysisResult.atsScore * 0.9 + Math.random() * 10;
            analysisResult.atsScore = Math.min(Math.round(scaledScore), 100);

            // console.log('Analysis Result: ', analysisResult);

            // Step 2: Enhance the resume text based on the improvement points
            const improvementPoints = analysisResult.improvements;
            const enhancementResponse = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `The following resume text has been analyzed and the following improvement points were identified:
                                            \n\nImprovement Points:\n${improvementPoints.join('\n')}
                                            \n\nPlease enhance the resume text to address these improvement points. Return the enhanced text for the specific sections that need improvement.
    
                                            Resume Text:\n\n${resumeText}`,
                        },
                    ],
                    max_tokens: 1000, // Increase max tokens for more detailed enhancements
                    temperature: 0.7, // Adjust temperature for more creative output
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'Resume Review Backend',
                    },
                }
            );

            // Check if the API returned an error
            if (enhancementResponse.data.error) {
                throw new Error(`OpenRouter API Error: ${enhancementResponse.data.error.message}`);
            }

            // Ensure the response contains the expected data
            if (!enhancementResponse.data.choices || !enhancementResponse.data.choices[0] || !enhancementResponse.data.choices[0].message) {
                throw new Error('Invalid response from OpenRouter API: Missing choices or message.');
            }

            const enhancedContent = enhancementResponse.data.choices[0].message.content.trim();


            // Return both the analysis result and the enhanced text
            return {
                analysis: analysisResult,
                enhancedSections: enhancedContent,
            };

        } catch (error) {
            console.log("Error: ", error);
            console.error('Error calculating ATS score or enhancing resume:', error.message);

            // Return a default response with a low ATS score and NA improvements
            return {
                analysis: {
                    atsScore: 40, // Set a low score for invalid documents
                    strengths: [],
                    improvements: ['NA - The document does not resemble a resume.'],
                },
                enhancedSections: 'NA - The document does not resemble a resume.',
            };
        }
    }
}

module.exports = AtsScoreForDifferentTypeResumes;