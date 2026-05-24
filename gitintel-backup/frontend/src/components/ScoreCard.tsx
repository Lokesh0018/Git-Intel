import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import type { ScoreCategory } from '../services/api';

interface ScoreCardProps {
  label: string;
  category: ScoreCategory;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, category }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine color theme based on score strength
  const getScoreColorClass = (score: number) => {
    if (score >= 75) return 'high';
    if (score >= 45) return 'mid';
    return 'low';
  };

  return (
    <article className={`score-card ${getScoreColorClass(category.score)}`}>
      <header onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div>
          <span className="score-label">{label}</span>
          <h3 className="score-num">{category.score}</h3>
        </div>
        <button className="expand-toggle" aria-label="Toggle details">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </header>
      <div className="meter">
        <span style={{ width: `${category.score}%` }}></span>
      </div>
      
      {/* Evidence list: show top 2 items when collapsed, all items when expanded */}
      <ul className="clean-list score-evidence">
        {(expanded ? category.evidence : category.evidence.slice(0, 2)).map((item, index) => (
          <li key={index} className="evidence-item">
            <span className="evidence-label">
              <CheckCircle size={13} className="check-icon" />
              {item.label}
            </span>
            <strong className="evidence-value">{item.value}</strong>
            {expanded && item.repositories && item.repositories.length > 0 && (
              <div className="evidence-repos">
                {item.repositories.slice(0, 3).map((r) => (
                  <span key={r} className="mini-repo-tag">{r}</span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
};

export default ScoreCard;
