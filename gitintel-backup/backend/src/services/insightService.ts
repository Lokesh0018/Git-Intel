import type { RepositoryDocument } from '../models/Repository.js';
import type { ScoreDocument } from '../models/Score.js';

type Scores = Omit<ScoreDocument, keyof Document>;

function role(score: number, evidence: string[], recommendations: string[]) {
  return { matchPercentage: Math.max(0, Math.min(100, Math.round(score))), evidence, recommendations };
}

export function buildInsights(repositories: RepositoryDocument[], scores: Scores) {
  const topRepos = [...repositories].sort((a, b) => b.complexityScore + b.stars - (a.complexityScore + a.stars)).slice(0, 3);
  const technologies = Array.from(new Set(repositories.flatMap((repo) => repo.technologies))).slice(0, 12);
  const strongest = [
    ['Backend', scores.backend.score],
    ['Frontend', scores.frontend.score],
    ['AI', scores.ai.score],
    ['DevOps', scores.devops.score],
    ['Testing', scores.testing.score],
    ['Security', scores.security.score]
  ].sort((a, b) => Number(b[1]) - Number(a[1]));

  const weaknesses = strongest
    .filter(([, score]) => Number(score) < 45)
    .map(([name]) => `${name} evidence is limited in the analyzed repositories.`);

  return {
    summary: `Analyzed ${repositories.length} repositories. Strongest visible areas are ${strongest
      .slice(0, 3)
      .map(([name]) => name)
      .join(', ')} with evidence from ${topRepos.map((repo) => repo.name).join(', ') || 'available repositories'}.`,
    strengths: [
      `Detected ${technologies.length} notable technologies: ${technologies.slice(0, 8).join(', ') || 'none detected'}.`,
      `Top repository complexity averages ${Math.round(topRepos.reduce((sum, repo) => sum + repo.complexityScore, 0) / Math.max(1, topRepos.length))}/100.`,
      `Open-source impact score is ${scores.impact.score}/100.`
    ],
    weaknesses: weaknesses.length ? weaknesses : ['No major gaps surfaced from the analyzed public repositories.'],
    recommendedRoles: [
      {
        role: 'Backend Engineer',
        ...role(
          scores.backend.score * 0.7 + scores.devops.score * 0.15 + scores.testing.score * 0.15,
          ['Backend technologies', 'Repository complexity', 'Delivery and testing signals'],
          ['Add deeper API design documentation and production observability examples.']
        )
      },
      {
        role: 'Frontend Engineer',
        ...role(
          scores.frontend.score * 0.75 + scores.testing.score * 0.15 + scores.impact.score * 0.1,
          ['Frontend frameworks', 'UI repositories', 'Testing signals'],
          ['Showcase accessibility, design systems, and end-to-end tests.']
        )
      },
      {
        role: 'Full Stack Engineer',
        ...role(
          scores.backend.score * 0.35 + scores.frontend.score * 0.35 + scores.devops.score * 0.15 + scores.testing.score * 0.15,
          ['Backend and frontend overlap', 'Deployment readiness', 'Testing breadth'],
          ['Add full-stack case studies with architecture diagrams.']
        )
      },
      {
        role: 'AI Engineer',
        ...role(
          scores.ai.score * 0.7 + scores.backend.score * 0.15 + scores.devops.score * 0.15,
          ['AI/ML libraries', 'Data-oriented project signals'],
          ['Publish model evaluation details and reproducible experiments.']
        )
      },
      {
        role: 'DevOps Engineer',
        ...role(
          scores.devops.score * 0.75 + scores.security.score * 0.15 + scores.consistency.score * 0.1,
          ['Deployment files', 'CI/CD and infrastructure signals'],
          ['Add infrastructure-as-code and monitoring examples.']
        )
      },
      {
        role: 'Data Engineer',
        ...role(
          scores.ai.score * 0.35 + scores.backend.score * 0.25 + scores.devops.score * 0.2 + scores.consistency.score * 0.2,
          ['Data and backend signals', 'Operational maturity'],
          ['Add ETL, orchestration, and warehouse-focused repositories.']
        )
      }
    ].sort((a, b) => b.matchPercentage - a.matchPercentage)
  };
}
