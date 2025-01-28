const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

class KeywordsMatchScore {

    static async calculateKeywordMatchScore(jobDescription, resumeText) {
        try {

            const jdKeywords = await KeywordsMatchScore.extractKeywords(jobDescription);
            const resumeKeywords = await KeywordsMatchScore.extractKeywords(resumeText);

            const matchedKeywords = jdKeywords.filter(keyword => resumeKeywords.includes(keyword));
            let keywordMatchScore = (matchedKeywords.length / jdKeywords.length) * 100;
            return keywordMatchScore;
        } catch (error) {
            console.error('Error calculating keyword match score:', error);
            return 0; // Return 0 if there's an error
        }
    }

    static async extractKeywords(text) {
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Extract keywords from the following text:\n\n${text}`,
                        },
                    ],
                    max_tokens: 50,
                    temperature: 0, // Set temperature to 0 for deterministic output
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ROUTER_API_KEY}`, // Use OpenRouter API key
                        'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
                        'X-Title': 'Resume Review Backend', // Optional: Your app name
                    },
                }
            );

            const keywords = response.data.choices[0].message.content.trim().split(', ');
            // console.log("Extracted Keywords:", keywords);
            return keywords;
        } catch (error) {
            console.error('Error extracting keywords:', error.response ? error.response.data : error.message);
            throw new Error('Failed to extract keywords.');
        }
    }





}

module.exports = KeywordsMatchScore;