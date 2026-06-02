import skillMapping from '../data/skillMapping.json' with { type: 'json' };
import type { RepositoryDocument } from '../models/Repository.js';
import type { InsightDocument } from '../models/Insight.js';

export function extractJobSkills(jobDescription: string) {
  const lower = jobDescription.toLowerCase();
  return Array.from(new Set(Object.values(skillMapping).flat().filter((skill) => lower.includes(skill.toLowerCase()))));
}

export function matchJob(jobDescription: string, repositories: RepositoryDocument[], insights?: InsightDocument | null) {
  const requiredSkills = extractJobSkills(jobDescription);
  const profileSkills = Array.from(new Set(repositories.flatMap((repo) => repo.technologies.map((technology) => technology.toLowerCase()))));
  const matched = requiredSkills.filter((skill) => profileSkills.includes(skill.toLowerCase()));
  const missing = requiredSkills.filter((skill) => !profileSkills.includes(skill.toLowerCase()));
  const matchPercentage = requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 100) : 50;

  return {
    matchPercentage,
    requiredSkills,
    preferredSkills: requiredSkills.slice(0, 6),
    technologies: matched,
    experienceAreas: insights?.recommendedRoles.slice(0, 3).map((role) => role.role) ?? [],
    strengths: matched.length ? matched.map((skill) => `Public repository evidence for ${skill}.`) : ['General GitHub activity is available, but few explicit job skills were found.'],
    missingSkills: missing,
    hiringRecommendation:
      matchPercentage >= 75
        ? 'Strong match. Advance to technical interview with repository deep-dive.'
        : matchPercentage >= 45
          ? 'Partial match. Interview if adjacent experience is acceptable.'
          : 'Low evidence match. Request additional work samples before proceeding.'
  };
}
