import skillMapping from '../data/skillMapping.json' with { type: 'json' };
import type { RepositoryDocument } from '../models/Repository.js';
import type { ScoreWithEvidence } from '../types/domain.js';

function clamp(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreCategory(repositories: RepositoryDocument[], category: keyof typeof skillMapping): ScoreWithEvidence {
  const mappedSkills = new Set(skillMapping[category].map((skill) => skill.toLowerCase()));
  const matchingRepos = repositories.filter((repo) =>
    repo.technologies.some((technology) => mappedSkills.has(technology.toLowerCase()))
  );
  const technologyDepth = Math.min(100, matchingRepos.reduce((sum, repo) => sum + repo.technologies.length * 6, 0));
  const complexity = matchingRepos.length
    ? matchingRepos.reduce((sum, repo) => sum + repo.complexityScore, 0) / matchingRepos.length
    : 0;
  const activity = Math.min(100, matchingRepos.reduce((sum, repo) => sum + repo.commits, 0));
  const impact = Math.min(100, matchingRepos.reduce((sum, repo) => sum + repo.stars * 6 + repo.forks * 4, 0));

  return {
    score: clamp(0.4 * technologyDepth + 0.2 * complexity + 0.2 * activity + 0.2 * impact),
    evidence: [
      { label: 'Matching repositories', value: matchingRepos.length, repositories: matchingRepos.map((repo) => repo.name) },
      { label: 'Technology depth', value: technologyDepth },
      { label: 'Average complexity', value: clamp(complexity) },
      { label: 'Activity signal', value: activity },
      { label: 'Impact signal', value: impact }
    ]
  };
}

export function calculateScores(repositories: RepositoryDocument[]) {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks, 0);
  const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers, 0);
  const totalCommits = repositories.reduce((sum, repo) => sum + repo.commits, 0);
  const mergedPulls = repositories.reduce((sum, repo) => sum + Number(repo.evidence.find((item) => item.label === 'Merged PRs')?.value ?? 0), 0);
  const activeMonths = new Set(repositories.map((repo) => repo.pushedAt?.toISOString().slice(0, 7)).filter(Boolean)).size;
  const multiContributorProxy = repositories.filter((repo) => repo.forks > 0 || repo.openIssues > 0).length;

  return {
    backend: scoreCategory(repositories, 'backend'),
    frontend: scoreCategory(repositories, 'frontend'),
    ai: scoreCategory(repositories, 'ai'),
    devops: scoreCategory(repositories, 'devops'),
    testing: scoreCategory(repositories, 'testing'),
    security: scoreCategory(repositories, 'security'),
    impact: {
      score: clamp(totalStars * 4 + totalForks * 5 + totalWatchers * 2 + mergedPulls * 3),
      evidence: [
        { label: 'Stars', value: totalStars },
        { label: 'Forks', value: totalForks },
        { label: 'Watchers', value: totalWatchers },
        { label: 'Merged pull requests', value: mergedPulls }
      ]
    },
    consistency: {
      score: clamp(activeMonths * 12 + totalCommits * 0.35),
      evidence: [
        { label: 'Recently active months represented', value: activeMonths },
        { label: 'Sampled commits', value: totalCommits }
      ]
    },
    collaboration: {
      score: clamp(mergedPulls * 5 + multiContributorProxy * 9 + repositories.reduce((sum, repo) => sum + repo.openIssues, 0) * 0.7),
      evidence: [
        { label: 'Merged pull requests', value: mergedPulls },
        { label: 'Repositories with collaboration signals', value: multiContributorProxy }
      ]
    }
  };
}
