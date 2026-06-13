export type EvidenceItem = {
  label: string;
  value: string | number;
  repositories?: string[];
};

export type ScoreCategory = {
  score: number;
  evidence: EvidenceItem[];
};

export type ProfileBundle = {
  profile: {
    username: string;
    avatarUrl: string;
    name?: string;
    bio?: string;
    followers: number;
    following: number;
    publicRepos: number;
    analyzedAt: string;
    shareToken: string;
  };
  repositories: Array<{
    name: string;
    fullName: string;
    description?: string;
    language?: string;
    stars: number;
    forks: number;
    commits: number;
    technologies: string[];
    complexityScore: number;
    projectType: string;
    summary: string;
    evidence: EvidenceItem[];
    pushedAt?: string;
  }>;
  scores: Record<string, ScoreCategory>;
  insights: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendedRoles: Array<{
      role: string;
      matchPercentage: number;
      evidence: string[];
      recommendations: string[];
    }>;
  };
};

export type JobMatch = {
  matchPercentage: number;
  requiredSkills: string[];
  technologies: string[];
  strengths: string[];
  missingSkills: string[];
  hiringRecommendation: string;
};

import { storage } from './storage';
import { githubService } from './github';
import { analyzerService } from './analyzer';

export const api = {
  async analyze(username: string): Promise<ProfileBundle> {
    // 1. Check if we already have it in storage to save API calls
    let existing = storage.getCandidate(username);
    if (existing) {
      // We could re-analyze or just return existing. We will fetch fresh.
    }

    try {
      const profile = await githubService.getUserProfile(username);
      const repos = await githubService.getUserRepositories(username);
      
      const languagesMap: Record<string, Record<string, number>> = {};
      const packageJsonsMap: Record<string, any> = {};
      
      // Limit to top 10 recent repos for language analysis to avoid excessive API calls
      const topRepos = repos.slice(0, 10);
      await Promise.all(topRepos.map(async (repo) => {
        try {
          languagesMap[repo.name] = await githubService.getLanguages(username, repo.name);
        } catch (e) {
          console.warn(`Could not fetch languages for ${repo.name}`);
        }
        try {
          packageJsonsMap[repo.name] = await githubService.getPackageJson(username, repo.name);
        } catch (e) {
          console.warn(`Could not fetch package.json for ${repo.name}`);
        }
      }));

      const bundle = analyzerService.analyze(profile, repos, languagesMap, packageJsonsMap);
      return bundle;
    } catch (e: any) {
      throw new Error(e.message || 'Failed to analyze candidate');
    }
  },
  
  async profile(username: string): Promise<ProfileBundle> {
    const candidate = storage.getCandidate(username);
    if (!candidate) throw new Error('Candidate not found locally. Please analyze first.');
    return candidate;
  },

  async jobMatch(username: string, jobDescription: string): Promise<JobMatch> {
    const candidate = storage.getCandidate(username);
    if (!candidate) throw new Error('Candidate not found locally.');
    
    // Deterministic mock job match based on candidate's strengths and the job description
    const descLower = jobDescription.toLowerCase();
    let matchPercentage = 50;
    const requiredSkills: string[] = [];
    
    // Simple heuristic: if desc contains tech from candidate strengths, boost score
    candidate.insights.strengths.forEach(s => {
      if (descLower.includes(s.toLowerCase())) {
        matchPercentage += 10;
        requiredSkills.push(s);
      }
    });

    matchPercentage = Math.min(100, Math.max(0, matchPercentage + Math.round(candidate.scores.overall.score / 5)));
    
    let recommendation = 'Consider';
    if (matchPercentage > 85) recommendation = 'Highly Recommended';
    else if (matchPercentage > 70) recommendation = 'Recommended';
    else if (matchPercentage < 50) recommendation = 'Not Recommended';

    return {
      matchPercentage,
      requiredSkills: requiredSkills.length ? requiredSkills : ['General Programming'],
      technologies: candidate.insights.strengths,
      strengths: candidate.insights.strengths,
      missingSkills: ['Specific domain knowledge'], // Mocked
      hiringRecommendation: recommendation
    };
  },

  async report(username: string): Promise<ProfileBundle> {
    const candidate = storage.getCandidate(username);
    if (!candidate) throw new Error('Report not found locally.');
    return candidate;
  }
};
