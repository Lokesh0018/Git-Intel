import crypto from 'crypto';
import { GithubProfile } from '../models/GithubProfile.js';
import { Insight } from '../models/Insight.js';
import { Repository } from '../models/Repository.js';
import { Score } from '../models/Score.js';
import { analyzeRepository } from '../ai/repositoryAnalyzer.js';
import { githubService } from './githubService.js';
import { calculateScores } from './scoringService.js';
import { buildInsights } from './insightService.js';

export async function analyzeGithubUsername(username: string) {
  const cleanUsername = username.trim().replace(/^@/, '');
  const [user, repos] = await Promise.all([
    githubService.getUser(cleanUsername),
    githubService.getRepositories(cleanUsername)
  ]);

  const profile = await GithubProfile.findOneAndUpdate(
    { username: user.login.toLowerCase() },
    {
      username: user.login.toLowerCase(),
      avatarUrl: user.avatar_url,
      name: user.name,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      analyzedAt: new Date(),
      $setOnInsert: { shareToken: crypto.randomBytes(18).toString('hex') }
    },
    { new: true, upsert: true }
  );

  await Repository.deleteMany({ profileId: profile._id });

  const analyzedRepositories = [];
  for (const repo of repos) {
    const signals = await githubService.getRepoSignals(repo);
    const analysis = await analyzeRepository(repo, signals);
    analyzedRepositories.push(
      await Repository.create({
        profileId: profile._id,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        commits: signals.commits,
        topics: repo.topics ?? [],
        technologies: analysis.detectedSkills,
        complexityScore: analysis.complexityScore,
        projectType: analysis.projectType,
        summary: analysis.summary,
        evidence: [
          ...analysis.evidence,
          { label: 'Pull requests', value: signals.pulls, repositories: [repo.name] },
          { label: 'Merged PRs', value: signals.mergedPulls, repositories: [repo.name] },
          { label: 'Issues', value: signals.issues, repositories: [repo.name] }
        ],
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : undefined
      })
    );
  }

  const scorePayload = calculateScores(analyzedRepositories);
  const score = await Score.findOneAndUpdate({ profileId: profile._id }, scorePayload, { new: true, upsert: true });
  const insightPayload = buildInsights(analyzedRepositories, score);
  const insight = await Insight.findOneAndUpdate({ profileId: profile._id }, insightPayload, { new: true, upsert: true });

  return { profile, repositories: analyzedRepositories, scores: score, insights: insight };
}

export async function getProfileBundle(usernameOrShareToken: string) {
  const profile = await GithubProfile.findOne({
    $or: [{ username: usernameOrShareToken.toLowerCase() }, { shareToken: usernameOrShareToken }]
  });
  if (!profile) return undefined;
  const [repositories, scores, insights] = await Promise.all([
    Repository.find({ profileId: profile._id }).sort({ complexityScore: -1, stars: -1 }),
    Score.findOne({ profileId: profile._id }),
    Insight.findOne({ profileId: profile._id })
  ]);
  return { profile, repositories, scores, insights };
}
