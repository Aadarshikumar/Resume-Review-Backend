const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

class StructureReadabilityScore {
    static async calculateStructureReadabilityScore(resumeText) {
        try {
          // Step 1: Analyze the resume structure and readability
          const analysis = await StructureReadabilityScore.analyzeResumeStructure(resumeText);
    
          // Step 2: Calculate the structure and readability score
          const structureReadabilityScore = StructureReadabilityScore.evaluateStructureReadability(analysis);
    
          // console.log("Structure and Readability Score:", structureReadabilityScore);
          return structureReadabilityScore;
        } catch (error) {
          console.error('Error calculating structure and readability score:', error);
          return 0; // Return 0 if there's an error
        }
      }
    
    
      static async analyzeResumeStructure(text) {
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'openai/gpt-3.5-turbo', // Use a supported model via OpenRouter
              messages: [
                {
                  role: 'user',
                  content: `Analyze the structure and readability of the following resume text:\n\n${text}\n\nReturn the result in JSON format like this:\n{\n  "headings": true,\n  "bulletPoints": true,\n  "consistency": true,\n  "length": "appropriate"\n}`,
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
    
          // Parse the content into a JSON object
          const analysis = JSON.parse(content);
          // console.log("Resume Structure Analysis:", analysis);
          return analysis;
        } catch (error) {
          console.error('Error analyzing resume structure:', error.response ? error.response.data : error.message);
          throw new Error('Failed to analyze resume structure.');
        }
      }
    
    
      static async evaluateStructureReadability(analysis) {
        try {
          let score = 0;
    
          // Check for headings
          if (analysis.headings) {
            score += 25; // 25 points for clear headings
          }
    
          // Check for bullet points
          if (analysis.bulletPoints) {
            score += 25; // 25 points for using bullet points
          }
    
          // Check for consistency
          if (analysis.consistency) {
            score += 25; // 25 points for consistent formatting
          }
    
          // Check for appropriate length
          if (analysis.length === "appropriate") {
            score += 25; // 25 points for appropriate length
          }
    
          return score;
        } catch (error) {
          console.error('Error evaluating structure readability:', error);
          return 0; // Return 0 if there's an error
        }
      }

}

module.exports = StructureReadabilityScore;