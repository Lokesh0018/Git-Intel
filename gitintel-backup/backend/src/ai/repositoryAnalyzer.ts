import OpenAI from 'openai';
import skillMapping from '../data/skillMapping.json' with { type: 'json' };
import { env } from '../config/env.js';
import type { GithubRepo, RepoSignals } from '../services/githubService.js';
import type { RepositoryAnalysis } from '../types/domain.js';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : undefined;

const configTechnologyMap: Record<string, string> = {
  'package.json': 'node.js',
  'package-lock.json': 'node.js',
  'yarn.lock': 'node.js',
  'requirements.txt': 'python',
  'pyproject.toml': 'python',
  Dockerfile: 'docker',
  'docker-compose.yml': 'docker compose',
  '.github': 'github actions',
  'terraform.tf': 'terraform',
  'k8s.yml': 'kubernetes'
};

function dependenciesFromPackageJson(packageJson?: Record<string, unknown>) {
  const deps = {
    ...((packageJson?.dependencies as Record<string, string> | undefined) ?? {}),
    ...((packageJson?.devDependencies as Record<string, string> | undefined) ?? {})
  };
  return Object.keys(deps);
}

export function detectTechnologies(repo: GithubRepo, signals: RepoSignals) {
  const text = [
    repo.language,
    repo.description,
    ...(repo.topics ?? []),
    ...Object.keys(signals.languages),
    ...signals.files.map((file) => configTechnologyMap[file] ?? file),
    ...dependenciesFromPackageJson(signals.packageJson)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const known = Object.values(skillMapping).flat();
  const detected = new Set<string>();
  for (const skill of known) {
    if (text.includes(skill.toLowerCase())) detected.add(skill);
  }
  if (repo.language) detected.add(repo.language.toLowerCase());
  return Array.from(detected).sort();
}

function localAnalyze(repo: GithubRepo, signals: RepoSignals): RepositoryAnalysis {
  const technologies = detectTechnologies(repo, signals);
  const hasTests = signals.files.some((file) => /test|spec|vitest|jest|pytest/i.test(file)) || technologies.includes('jest');
  const hasCi = signals.files.some((file) => /workflow|action/i.test(file)) || technologies.includes('github actions');
  const hasDocker = technologies.includes('docker') || technologies.includes('docker compose');
  const hasDb = technologies.some((tech) => ['mongodb', 'postgresql', 'mysql', 'redis'].includes(tech));
  const hasSecurity = technologies.some((tech) => ['jwt', 'bcrypt', 'helmet', 'oauth', 'rate limit'].includes(tech));

  const complexityScore = Math.min(
    100,
    20 +
      Math.min(20, technologies.length * 3) +
      Math.min(15, Object.keys(signals.languages).length * 4) +
      (hasTests ? 10 : 0) +
      (hasCi ? 10 : 0) +
      (hasDocker ? 10 : 0) +
      (hasDb ? 8 : 0) +
      (hasSecurity ? 7 : 0)
  );

  const projectType = technologies.includes('vue') || technologies.includes('react') ? 'Web application' : hasDb ? 'Backend service' : 'Software project';

  return {
    projectType,
    complexityScore,
    detectedSkills: technologies,
    summary: `${repo.name} appears to be a ${projectType.toLowerCase()} using ${technologies.slice(0, 6).join(', ') || repo.language || 'general software practices'}.`,
    evidence: [
      { label: 'Technologies detected', value: technologies.length, repositories: [repo.name] },
      { label: 'Languages used', value: Object.keys(signals.languages).join(', ') || repo.language || 'Unknown', repositories: [repo.name] },
      { label: 'Delivery signals', value: [hasTests && 'tests', hasCi && 'CI/CD', hasDocker && 'Docker'].filter(Boolean).join(', ') || 'basic', repositories: [repo.name] }
    ]
  };
}

export async function analyzeRepository(repo: GithubRepo, signals: RepoSignals): Promise<RepositoryAnalysis> {
  if (!openai) return localAnalyze(repo, signals);

  const fallback = localAnalyze(repo, signals);
  const prompt = {
    repository: {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics,
      files: signals.files,
      languages: signals.languages,
      packageJson: signals.packageJson,
      readme: signals.readme?.slice(0, 6000)
    },
    requiredShape: {
      projectType: 'string',
      complexityScore: 'integer 0-100',
      detectedSkills: ['string'],
      summary: 'string',
      evidence: [{ label: 'string', value: 'string or number', repositories: ['string'] }]
    }
  };

  try {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze GitHub repositories for recruiter-facing developer intelligence. Return only valid JSON. Be evidence-based and avoid unsupported claims.'
        },
        { role: 'user', content: JSON.stringify(prompt) }
      ],
      temperature: 0.2
    });
    const parsed = JSON.parse(response.choices[0]?.message.content ?? '{}') as RepositoryAnalysis;
    return {
      ...fallback,
      ...parsed,
      complexityScore: Math.max(0, Math.min(100, Math.round(parsed.complexityScore ?? fallback.complexityScore))),
      detectedSkills: Array.from(new Set([...(parsed.detectedSkills ?? []), ...fallback.detectedSkills]))
    };
  } catch {
    return fallback;
  }
}
