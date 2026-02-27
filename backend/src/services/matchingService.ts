import { Pool } from 'pg';

interface MatchScore {
  jobId: number;
  userId: number;
  score: number;
  breakdown: {
    hardSkillsScore: number;
    experienceScore: number;
    missingRequiredSkills: string[];
    matchedSkills: string[];
  };
  color: 'green' | 'orange' | 'gray';
}

interface CareerRoadmapStep {
  skill: string;
  category: string;
  isAcquired: boolean;
  isRequired: boolean;
  suggestedFormations: Array<{
    id: number;
    title: string;
    category: string;
    level: string;
    duration: string;
  }>;
}

interface CareerRoadmap {
  targetJobId: number;
  targetJobTitle: string;
  acquiredSkills: string[];
  missingSkills: CareerRoadmapStep[];
  completionPercentage: number;
}

const MATCH_SCORE_CACHE = new Map<string, { data: MatchScore; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Extracts skills from text (description, requirements)
 * Simple keyword matching against common tech/soft skills
 */
export function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    // Hard Skills - Programming
    'javascript', 'typescript', 'python', 'java', 'c#', 'c\\+\\+', 'php', 'ruby', 'go', 'rust', 'kotlin',
    'react', 'vue', 'angular', 'node.js', 'express', 'django', 'flask', 'spring', 'fastapi',
    'sql', 'postgresql', 'mongodb', 'mysql', 'redis', 'elasticsearch',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd', 'jenkins', 'gitlab',
    'html', 'css', 'scss', 'webpack', 'gulp', 'graphql', 'rest', 'api',
    'testing', 'jest', 'mocha', 'pytest', 'unittest', 'tdd',
    'agile', 'scrum', 'jira', 'trello', 'asana',
    'linux', 'unix', 'windows server', 'bash', 'shell',
    'machine learning', 'tensorflow', 'pytorch', 'nltk', 'scikit-learn',
    'salesforce', 'sap', 'oracle', 'crm', 'erp',
    'figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator', 'ui/ux',
    'excel', 'power bi', 'tableau', 'data analysis', 'data visualization',
    
    // Soft Skills
    'communication', 'leadership', 'management', 'teamwork', 'collaboration',
    'problem solving', 'critical thinking', 'creativity', 'innovation',
    'project management', 'planning', 'organization', 'time management',
    'negotiation', 'presentation', 'public speaking', 'writing',
    'customer service', 'client relations', 'sales', 'marketing', 'business development',
    'training', 'mentoring', 'coaching', 'education',
    'attention to detail', 'quality assurance', 'qa', 'testing',
    'analytical', 'strategic thinking', 'decision making',
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = new Set<string>();

  for (const skill of commonSkills) {
    // Use word boundaries for more accurate matching
    const regex = new RegExp(`\\b${skill}\\b`, 'gi');
    if (regex.test(lowerText)) {
      // Store the skill in a canonical form
      foundSkills.add(skill.replace(/\\\+\\\+/g, 'c++'));
    }
  }

  return Array.from(foundSkills);
}

/**
 * Calculates match score between candidate and job
 * Formula: 70% hard skills + 30% experience
 * Applied -20% penalty if required skill is missing
 */
export async function calculateMatchScore(
  pool: Pool,
  userId: number,
  jobId: number
): Promise<MatchScore> {
  const cacheKey = `match_${userId}_${jobId}`;
  const cached = MATCH_SCORE_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Get user profile and skills
  const userResult = await pool.query(
    `SELECT experience_years, years_experience, skills, qualification 
     FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userResult.rows[0];
  const userSkills = Array.isArray(user.skills) ? user.skills : [];
  const userExperienceYears = user.experience_years || user.years_experience || 0;
  const userQualification = user.qualification || '';

  // Get job details
  const jobResult = await pool.query(
    `SELECT id, title, description, type FROM jobs WHERE id = $1`,
    [jobId]
  );

  if (jobResult.rows.length === 0) {
    throw new Error('Job not found');
  }

  const job = jobResult.rows[0];
  const jobDescription = job.description || '';

  // Extract required skills from job description
  const jobSkills = extractSkillsFromText(job.title + ' ' + jobDescription);
  
  // Get required skills from job_requirements table if exists
  const requiredSkillsResult = await pool.query(
    `SELECT skill, is_required FROM job_requirements WHERE job_id = $1`,
    [jobId]
  ).catch(() => ({ rows: [] }));

  const requiredSkills = new Set<string>();
  const optionalSkills = new Set<string>();

  // Add skills from extraction
  for (const skill of jobSkills) {
    optionalSkills.add(skill);
  }

  // Override with database requirements if available
  for (const req of requiredSkillsResult.rows) {
    if (req.is_required) {
      requiredSkills.add(req.skill.toLowerCase());
      optionalSkills.delete(req.skill.toLowerCase());
    } else {
      optionalSkills.add(req.skill.toLowerCase());
      requiredSkills.delete(req.skill.toLowerCase());
    }
  }

  // Match user skills against job requirements
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  let matchedSkills = 0;
  const matchedSkillsList: string[] = [];
  const missingRequiredSkills: string[] = [];

  for (const skill of optionalSkills) {
    if (normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))) {
      matchedSkills++;
      matchedSkillsList.push(skill);
    }
  }

  for (const skill of requiredSkills) {
    if (!normalizedUserSkills.some(us => us.includes(skill) || skill.includes(us))) {
      missingRequiredSkills.push(skill);
    } else {
      matchedSkills++;
      matchedSkillsList.push(skill);
    }
  }

  // Calculate hard skills score (70%)
  const totalSkillsRequired = requiredSkills.size + optionalSkills.size;
  let hardSkillsScore = totalSkillsRequired > 0 ? (matchedSkills / totalSkillsRequired) * 100 : 0;

  // Apply -20% penalty for each missing required skill
  const requiredSkillsPenalty = missingRequiredSkills.length * 20;
  hardSkillsScore = Math.max(0, hardSkillsScore - requiredSkillsPenalty);

  // Calculate experience score (30%)
  // Assume most junior roles need 0-2 years, mid-level 2-5 years, senior 5+ years
  let experienceScore = 0;
  if (jobDescription.toLowerCase().includes('senior')) {
    experienceScore = userExperienceYears >= 5 ? 100 : Math.min(100, userExperienceYears * 20);
  } else if (jobDescription.toLowerCase().includes('junior')) {
    experienceScore = userExperienceYears <= 2 ? 100 : Math.max(0, 100 - (userExperienceYears - 2) * 10);
  } else {
    // Mid-level default
    experienceScore = userExperienceYears >= 2 && userExperienceYears <= 5 ? 100 : Math.min(100, userExperienceYears * 20);
  }

  // Final score calculation: 70% hard skills + 30% experience
  const finalScore = Math.round((hardSkillsScore * 0.7) + (experienceScore * 0.3));

  // Determine color
  let color: 'green' | 'orange' | 'gray';
  if (finalScore >= 75) {
    color = 'green';
  } else if (finalScore >= 45) {
    color = 'orange';
  } else {
    color = 'gray';
  }

  const result: MatchScore = {
    jobId,
    userId,
    score: Math.min(100, finalScore),
    breakdown: {
      hardSkillsScore: Math.min(100, hardSkillsScore),
      experienceScore,
      missingRequiredSkills,
      matchedSkills: matchedSkillsList,
    },
    color,
  };

  // Cache the result
  MATCH_SCORE_CACHE.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

/**
 * Generates career roadmap with missing skills and suggested formations
 */
export async function generateCareerRoadmap(
  pool: Pool,
  userId: number,
  targetJobId: number
): Promise<CareerRoadmap> {
  // Get user skills
  const userResult = await pool.query(
    `SELECT skills FROM users WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  const userSkills = Array.isArray(userResult.rows[0].skills) ? userResult.rows[0].skills : [];
  const normalizedUserSkills = userSkills.map(s => typeof s === 'string' ? s.toLowerCase() : String(s).toLowerCase());

  // Get target job
  const jobResult = await pool.query(
    `SELECT id, title, description FROM jobs WHERE id = $1`,
    [targetJobId]
  );

  if (jobResult.rows.length === 0) {
    throw new Error('Job not found');
  }

  const job = jobResult.rows[0];
  const jobDescription = job.description || '';

  // Extract required skills from job
  const requiredSkills = extractSkillsFromText(job.title + ' ' + jobDescription);

  // Get job_requirements if table exists
  const jobReqResult = await pool.query(
    `SELECT skill, is_required FROM job_requirements WHERE job_id = $1`,
    [targetJobId]
  ).catch(() => ({ rows: [] }));

  const allRequiredSkills = new Set<string>();
  for (const skill of requiredSkills) {
    allRequiredSkills.add(skill);
  }
  for (const req of jobReqResult.rows) {
    if (req.is_required) {
      allRequiredSkills.add(req.skill);
    }
  }

  // Identify acquired vs missing skills
  const acquiredSkills: string[] = [];
  const missingSkills: CareerRoadmapStep[] = [];

  for (const skill of allRequiredSkills) {
    const lowerSkill = skill.toLowerCase();
    const isAcquired = normalizedUserSkills.some(
      us => us.includes(lowerSkill) || lowerSkill.includes(us)
    );

    if (isAcquired) {
      acquiredSkills.push(skill);
    } else {
      // Find suggested formations for this skill
      const formationResult = await pool.query(
        `SELECT id, title, category, level, duration 
         FROM formations 
         WHERE published = true 
         AND (title ILIKE $1 OR description ILIKE $1 OR category ILIKE $1)
         LIMIT 3`,
        [`%${skill}%`]
      );

      missingSkills.push({
        skill,
        category: 'technical',
        isAcquired: false,
        isRequired: true,
        suggestedFormations: formationResult.rows || [],
      });
    }
  }

  const completionPercentage = allRequiredSkills.size > 0
    ? Math.round((acquiredSkills.length / allRequiredSkills.size) * 100)
    : 0;

  return {
    targetJobId,
    targetJobTitle: job.title,
    acquiredSkills,
    missingSkills,
    completionPercentage,
  };
}

/**
 * Clears cache for a specific user (called when profile is updated)
 */
export function clearMatchingCacheForUser(userId: number) {
  const keysToDelete: string[] = [];
  for (const [key] of MATCH_SCORE_CACHE) {
    if (key.includes(`_${userId}_`) || key.includes(`match_${userId}`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => MATCH_SCORE_CACHE.delete(key));
}

export default {
  calculateMatchScore,
  generateCareerRoadmap,
  extractSkillsFromText,
  clearMatchingCacheForUser,
};
