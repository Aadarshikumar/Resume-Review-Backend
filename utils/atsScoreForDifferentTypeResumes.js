const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

// calculateATSForDiffResume

class AtsScoreForDifferentTypeResumes {
    static async calculateATSForDiffResume(resumeText) {
        try {
            // Step 1: Use OpenRouter API to analyze the resume text and generate ATS score, strengths, and improvements
            const analysisResponse = await axios.post(
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

            const analysisContent = analysisResponse.data.choices[0].message.content.trim();
            const analysisResult = JSON.parse(analysisContent);

            // Optional: Post-process the score for more variability
            const scaledScore = analysisResult.atsScore * 0.9 + Math.random() * 10;
            analysisResult.atsScore = Math.min(Math.round(scaledScore), 100);

            console.log('Analysis Result: ', analysisResult);

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

            const enhancedContent = enhancementResponse.data.choices[0].message.content.trim();

            console.log('Enhanced Resume Sections: ', enhancedContent);

            // Return both the analysis result and the enhanced text
            return {
                analysis: analysisResult,
                enhancedSections: enhancedContent,
            };

        } catch (error) {
            console.error('Error calculating ATS score or enhancing resume:', error.response ? error.response.data : error.message);
            throw new Error('Failed to calculate ATS score or enhance resume.');
        }
    }
}



module.exports = AtsScoreForDifferentTypeResumes;