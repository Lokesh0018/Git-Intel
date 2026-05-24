export type SkillCategory =
  | 'backend'
  | 'frontend'
  | 'ai'
  | 'devops'
  | 'testing'
  | 'security'
  | 'cloud'
  | 'dataEngineering'
  | 'mobile';

export interface EvidenceItem {
  label: string;
  value: string | number;
  repositories?: string[];
}

export interface RepositoryAnalysis {
  projectType: string;
  complexityScore: number;
  detectedSkills: string[];
  summary: string;
  evidence: EvidenceItem[];
}

export interface ScoreWithEvidence {
  score: number;
  evidence: EvidenceItem[];
}
