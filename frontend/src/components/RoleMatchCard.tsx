import React from 'react';
import { Award, Briefcase } from 'lucide-react';

interface RoleMatchCardProps {
  role: {
    role: string;
    matchPercentage: number;
    evidence: string[];
    recommendations: string[];
  };
}

const RoleMatchCard: React.FC<RoleMatchCardProps> = ({ role }) => {
  const getMatchColorClass = (pct: number) => {
    if (pct >= 75) return 'match-high';
    if (pct >= 45) return 'match-mid';
    return 'match-low';
  };

  return (
    <article className={`role-card ${getMatchColorClass(role.matchPercentage)}`}>
      <header>
        <div className="role-title-row">
          <Briefcase size={18} className="role-icon" />
          <span className="role-name">{role.role}</span>
        </div>
        <strong className="match-pct">{role.matchPercentage}%</strong>
      </header>
      <div className="meter">
        <span style={{ width: `${role.matchPercentage}%` }}></span>
      </div>
      <p className="role-evidence-list">
        <strong>Evidence:</strong> {role.evidence.join(', ')}
      </p>
      {role.recommendations && role.recommendations.length > 0 && (
        <div className="role-rec-box">
          <Award size={14} className="rec-icon" />
          <small className="role-recommendation">{role.recommendations[0]}</small>
        </div>
      )}
    </article>
  );
};

export default RoleMatchCard;
