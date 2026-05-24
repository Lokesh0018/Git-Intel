import React from 'react';
import { Star, GitFork, GitCommit, Code } from 'lucide-react';
import type { ProfileBundle } from '../services/api';

interface RepositoryCardProps {
  repository: ProfileBundle['repositories'][number];
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  return (
    <article className="repo-card">
      <header>
        <div>
          <h3>{repository.name}</h3>
          <span className="repo-project-type">{repository.projectType || 'Software project'}</span>
        </div>
        <div className="complexity-badge">
          <span className="complexity-label">Complexity</span>
          <strong className="complexity-val">{repository.complexityScore}</strong>
        </div>
      </header>
      <p className="repo-desc">{repository.summary || repository.description || 'No description provided.'}</p>
      <div className="repo-meta">
        <span className="meta-lang">
          <Code size={14} />
          {repository.language || 'Mixed'}
        </span>
        <span>
          <Star size={14} />
          {repository.stars} stars
        </span>
        <span>
          <GitFork size={14} />
          {repository.forks} forks
        </span>
        <span>
          <GitCommit size={14} />
          {repository.commits} commits
        </span>
      </div>
      <div className="chips">
        {repository.technologies.slice(0, 8).map((tech) => (
          <span key={tech} className="tech-chip">{tech}</span>
        ))}
      </div>
    </article>
  );
};

export default RepositoryCard;
