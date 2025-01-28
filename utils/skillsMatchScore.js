const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

class SkillsMatchScore {

    static async calculateSkillsMatchScore(resumeText, jobDescription) {
        try {

            // Calculate scores for each criterion
            const resumeSkills = await SkillsMatchScore.extractSkills(resumeText);
            const jdSkills = await SkillsMatchScore.extractSkills(jobDescription);

            const matchedSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
            const skillsMatchScore = (matchedSkills.length / jdSkills.length) * 100;

            return skillsMatchScore;
        } catch (error) {
            console.error('Error calculating skills match score:', error);
            return 0; // Return 0 if there's an error
        }
    }

    static async extractSkills(text) {
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
                    messages: [
                        {
                            role: 'user',
                            content: `Extract skills from the following text:\n\n${text}\n\nReturn the result as a comma-separated list of skills.`,
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

            // Split the content into an array of skills
            const skills = content.split(',').map(skill => skill.trim());
            // console.log("Extracted Skills:", skills);
            return skills;
        } catch (error) {
            console.error('Error extracting skills:', error.response ? error.response.data : error.message);
            throw new Error('Failed to extract skills.');
        }
    }


}

module.exports = SkillsMatchScore;