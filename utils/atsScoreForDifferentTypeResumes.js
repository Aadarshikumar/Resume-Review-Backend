const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

// calculateATSForDiffResume

class AtsScoreForDifferentTypeResumes {
    static async calculateATSForDiffResume(resumeText) {
        try {
            // Step 1: Use OpenRouter API to analyze the resume text and generate ATS score, strengths, and improvements
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Analyze the following resume text and provide:
                                            1. An overall ATS score out of 100, considering factors like experience, skills, readability, and formatting.
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

            const content = response.data.choices[0].message.content.trim();
            const result = JSON.parse(content);

            // Optional: Post-process the score for more variability
            const scaledScore = result.atsScore * 0.9 + Math.random() * 10;
            result.atsScore = Math.min(Math.round(scaledScore), 100);

            return result;

        } catch (error) {
            console.error('Error calculating ATS score:', error.response ? error.response.data : error.message);
            throw new Error('Failed to calculate ATS score.');
        }
    }
}



module.exports = AtsScoreForDifferentTypeResumes;