const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

class ExperienceRelevanceScore {
  static async calculateExperienceRelevanceScore(resumeText, jobDescription) {
    try {
      // Step 1: Extract job titles and industries from the resume and job description
      const resumeExperience = await ExperienceRelevanceScore.extractExperience(resumeText);
      const jdRequirements = await ExperienceRelevanceScore.extractExperience(jobDescription);

      // Step 2: Compare the extracted data to calculate relevance
      const relevanceScore = ExperienceRelevanceScore.compareExperience(resumeExperience, jdRequirements);

      return relevanceScore;
    } catch (error) {
      console.error('Error calculating experience relevance score:', error);
      return 0; // Return 0 if there's an error
    }
  }

  static async extractExperience(text) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
          messages: [
            {
              role: 'user',
              content: `Extract the following details from the text:\n\n${text}\n\nReturn the result in JSON format like this:\n{\n  "jobTitles": [],\n  "industries": [],\n  "responsibilities": []\n}`,
            },
          ],
          max_tokens: 1000, // Increased to 1000 to avoid truncation
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

      // Log the raw response for debugging
    //   console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      // Extract the content from the response
      let content = response.data.choices[0].message.content.trim();

      // Try to fix the JSON format if it's invalid
      if (!content.startsWith('{') || !content.endsWith('}')) {
        console.warn('Invalid JSON format in API response. Attempting to fix...');

        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          content = jsonMatch[0];
        } else {
          console.warn('Unable to extract valid JSON from response. Returning default experience object.');
          return {
            jobTitles: [],
            industries: [],
            responsibilities: [],
          };
        }
      }

      // Validate and fix the JSON string
      try {
        // Attempt to parse the JSON
        const experience = JSON.parse(content);
        // console.log("Extracted Experience:", experience);
        return experience;
      } catch (parseError) {
        console.warn('Failed to parse JSON. Attempting to fix...');

        // Try to fix the JSON by adding a closing brace if missing
        if (!content.endsWith('}')) {
          content += '}';
        }

        // Try to parse the fixed JSON
        try {
          const experience = JSON.parse(content);
        //   console.log("Extracted Experience (Fixed):", experience);
          return experience;
        } catch (finalError) {
          console.error('Failed to fix JSON. Returning default experience object.');
          return {
            jobTitles: [],
            industries: [],
            responsibilities: [],
          };
        }
      }
    } catch (error) {
      console.error('Error extracting experience:', error.response ? error.response.data : error.message);
      throw new Error('Failed to extract experience details.');
    }
  }

  static compareExperience(resumeExperience, jdRequirements) {
    let score = 0;

    // Step 1: Compare job titles
    const resumeJobTitles = resumeExperience.jobTitles || []; // Default to empty array if undefined
    const jdJobTitles = jdRequirements.jobTitles || []; // Default to empty array if undefined
    const jobTitleMatches = jdJobTitles.filter(title =>
      resumeJobTitles.includes(title)
    ).length;
    score += (jobTitleMatches / (jdJobTitles.length || 1)) * 40; // 40% weight (avoid division by zero)

    // Step 2: Compare industries
    const resumeIndustries = resumeExperience.industries || []; // Default to empty array if undefined
    const jdIndustries = jdRequirements.industries || []; // Default to empty array if undefined
    const industryMatches = jdIndustries.filter(industry =>
      resumeIndustries.includes(industry)
    ).length;
    score += (industryMatches / (jdIndustries.length || 1)) * 30; // 30% weight (avoid division by zero)

    // Step 3: Compare responsibilities
    const resumeResponsibilities = resumeExperience.responsibilities || []; // Default to empty array if undefined
    const jdResponsibilities = jdRequirements.responsibilities || []; // Default to empty array if undefined
    const responsibilityMatches = jdResponsibilities.filter(responsibility =>
      resumeResponsibilities.includes(responsibility)
    ).length;
    score += (responsibilityMatches / (jdResponsibilities.length || 1)) * 30; // 30% weight (avoid division by zero)

    return Math.round(score); // Round the score to the nearest integer
  }
}

module.exports = ExperienceRelevanceScore;