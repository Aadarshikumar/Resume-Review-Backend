const axios = require('axios'); // Add axios for making HTTP requests
const dotenv = require('dotenv');
dotenv.config();

const ExperienceRelevanceScore = require('./experienceRelevanceScore');
const KeywordsMatchScore = require('./keywordMatchScore');
const SkillsMatchScore = require('./skillsMatchScore');
const EducationCertificationsScore = require('./educationCertificationsScore');
const AccomplishmentsImpactScore = require('./accomplishmentsImpactScore');
const StructureReadabilityScore = require('./structureReadabilityScore');


class ScoringUtilService {
  static async calculateATSScore(resumeText, jobDescription) {

    // Step 0: Extract keywords from the JD and resume
    const keywordMatchScore = await KeywordsMatchScore.calculateKeywordMatchScore(jobDescription, resumeText);

    // Step 1: Extract Experience from the resume and JD
    const experienceRelevanceScore = await ExperienceRelevanceScore.calculateExperienceRelevanceScore(resumeText, jobDescription);

    //Step 2: Calculate scores for skills match
    const skillsMatchScore = await SkillsMatchScore.calculateSkillsMatchScore(resumeText, jobDescription);

    //Step 3: Calculate scores for education and certifications match
    const educationCertificationsScore = await EducationCertificationsScore.calculateEducationCertificationsScore(resumeText, jobDescription);

    //Step 4: Calculate scores for accomplishments impact
    const accomplishmentsImpactScore = await AccomplishmentsImpactScore.calculateAccomplishmentsImpactScore(resumeText);

    // Step 5: Calculate the structure and readability score
    const structureReadabilityScore = await StructureReadabilityScore.calculateStructureReadabilityScore(resumeText);


    // Calculate the final ATS score
    const atsScore = (
      keywordMatchScore * 0.3 +
      experienceRelevanceScore * 0.25 +
      skillsMatchScore * 0.2 +
      educationCertificationsScore * 0.1 +
      accomplishmentsImpactScore * 0.1 +
      structureReadabilityScore * 0.05
    );

    return {
      atsScore: Math.round(atsScore),
      breakdown: {
        keywordMatch: Math.round(keywordMatchScore),
        experienceRelevance: Math.round(experienceRelevanceScore),
        skillsMatch: Math.round(skillsMatchScore),
        educationCertifications: Math.round(educationCertificationsScore),
        accomplishmentsImpact: Math.round(accomplishmentsImpactScore),
        structureReadability: Math.round(structureReadabilityScore),
      },
    };
  }

}
module.exports = ScoringUtilService;