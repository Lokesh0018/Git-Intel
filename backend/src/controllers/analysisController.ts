import { z } from 'zod';
import { analyzeGithubUsername, getProfileBundle } from '../services/analysisService.js';
import { matchJob } from '../services/jobMatchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const usernameSchema = z.object({ username: z.string().min(1).max(39).regex(/^[a-zA-Z0-9-@]+$/) });
const jobMatchSchema = z.object({ username: z.string().min(1), jobDescription: z.string().min(30) });

export const analyze = asyncHandler(async (req, res) => {
  const { username } = usernameSchema.parse(req.body);
  const result = await analyzeGithubUsername(username);
  res.status(202).json(result);
});

export const getProfile = asyncHandler(async (req, res) => {
  const bundle = await getProfileBundle(req.params.username);
  if (!bundle) throw new HttpError(404, 'Profile has not been analyzed yet');
  res.json(bundle);
});

export const getSkills = asyncHandler(async (req, res) => {
  const bundle = await getProfileBundle(req.params.username);
  if (!bundle) throw new HttpError(404, 'Profile has not been analyzed yet');
  const skills = Array.from(new Set(bundle.repositories.flatMap((repo) => repo.technologies))).sort();
  res.json({ username: bundle.profile.username, skills });
});

export const getScores = asyncHandler(async (req, res) => {
  const bundle = await getProfileBundle(req.params.username);
  if (!bundle?.scores) throw new HttpError(404, 'Scores have not been generated yet');
  res.json(bundle.scores);
});

export const getInsights = asyncHandler(async (req, res) => {
  const bundle = await getProfileBundle(req.params.username);
  if (!bundle?.insights) throw new HttpError(404, 'Insights have not been generated yet');
  res.json(bundle.insights);
});

export const jobMatch = asyncHandler(async (req, res) => {
  const { username, jobDescription } = jobMatchSchema.parse(req.body);
  const bundle = await getProfileBundle(username);
  if (!bundle) throw new HttpError(404, 'Profile has not been analyzed yet');
  res.json(matchJob(jobDescription, bundle.repositories, bundle.insights));
});

export const report = asyncHandler(async (req, res) => {
  const bundle = await getProfileBundle(req.params.username);
  if (!bundle) throw new HttpError(404, 'Profile has not been analyzed yet');
  res.json({
    generatedAt: new Date().toISOString(),
    format: 'json',
    publicShareUrl: `/share/${bundle.profile.shareToken}`,
    ...bundle
  });
});
