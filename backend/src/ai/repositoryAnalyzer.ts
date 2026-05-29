import skillMapping from '../data/skillMapping.json' with { type: 'json' };
import type { GithubRepo, RepoSignals } from '../services/githubService.js';
import type { RepositoryAnalysis } from '../types/domain.js';

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
    summary: \ appears to be a \ using \.,
    evidence: [
      { label: 'Technologies detected', value: technologies.length, repositories: [repo.name] },
      { label: 'Languages used', value: Object.keys(signals.languages).join(', ') || repo.language || 'Unknown', repositories: [repo.name] },
      { label: 'Delivery signals', value: [hasTests && 'tests', hasCi && 'CI/CD', hasDocker && 'Docker'].filter(Boolean).join(', ') || 'basic', repositories: [repo.name] }
    ]
  };
}

export async function analyzeRepository(repo: GithubRepo, signals: RepoSignals): Promise<RepositoryAnalysis> {
  return localAnalyze(repo, signals);
}
