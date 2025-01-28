const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();


class AccomplishmentsImpactScore {

    static async calculateAccomplishmentsImpactScore(resumeText) {
        try {
            // Step 1: Extract accomplishments from the resume
            const accomplishments = await AccomplishmentsImpactScore.extractAccomplishments(resumeText);

            // Step 2: Calculate the accomplishments impact score
            const accomplishmentsImpactScore = AccomplishmentsImpactScore.evaluateAccomplishmentsImpact(accomplishments);

            // console.log("Accomplishments Impact Score:", accomplishmentsImpactScore);
            return accomplishmentsImpactScore;
        } catch (error) {
            console.error('Error calculating accomplishments impact score:', error);
            return 0; // Return 0 if there's an error
        }
    }

    static async extractAccomplishments(text) {
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Extract accomplishments, awards, and recognitions from the following text:\n\n${text}\n\nReturn the result as a comma-separated list.`,
                        },
                    ],
                    max_tokens: 200,
                    temperature: 0, // Set temperature to 0 for deterministic output
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ROUTER_API_KEY}`,
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'Resume Review Backend',
                    },
                }
            );

            // Extract the content from the response
            const content = response.data.choices[0].message.content.trim();

            // Split the content into an array of accomplishments
            const accomplishments = content.split(',').map(item => item.trim());
            // console.log("Extracted Accomplishments:", accomplishments);
            return accomplishments;
        } catch (error) {
            console.error('Error extracting accomplishments:', error.response ? error.response.data : error.message);
            throw new Error('Failed to extract accomplishments.');
        }
    }



    static async evaluateAccomplishmentsImpact(accomplishments) {
        try {
            if (accomplishments.length === 0) {
                return 0; // No accomplishments
            }

            // Assign a score based on the number and quality of accomplishments
            const baseScore = Math.min(accomplishments.length * 10, 100); // 10 points per accomplishment, capped at 100
            return baseScore;
        } catch (error) {
            console.error('Error evaluating accomplishments impact:', error);
            return 0; // Return 0 if there's an error
        }
    }
}

module.exports = AccomplishmentsImpactScore;