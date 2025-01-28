const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();


class EducationCertificationsScore {

    static async calculateEducationCertificationsScore(resumeText, jobDescription) {
        try {

            const resumeEducationCerts = await EducationCertificationsScore.extractEducationCertifications(resumeText);
            const jdEducationCerts = await EducationCertificationsScore.extractEducationCertifications(jobDescription);

            // Step 3: Calculate the education and certifications match score
            const matchedEducationCerts = jdEducationCerts.filter(item => resumeEducationCerts.includes(item));
            const educationCertificationsScore = (matchedEducationCerts.length / jdEducationCerts.length) * 100;

            // console.log("Education and Certifications Score:", educationCertificationsScore);
            return educationCertificationsScore;
        } catch (error) {
            console.error('Error calculating education and certifications score:', error);
            return 0; // Return 0 if there's an error
        }
    }

    static async extractEducationCertifications(text) {
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Extract education and certifications from the following text:\n\n${text}\n\nReturn the result as a comma-separated list.`,
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

            // Split the content into an array of education and certifications
            const educationCerts = content.split(',').map(item => item.trim());
            return educationCerts;
        } catch (error) {
            console.error('Error extracting education and certifications:', error.response ? error.response.data : error.message);
            throw new Error('Failed to extract education and certifications.');
        }
    }





}

module.exports = EducationCertificationsScore;