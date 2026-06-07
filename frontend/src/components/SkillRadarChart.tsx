import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { ProfileBundle } from '../services/api';

interface SkillRadarChartProps {
  scores: ProfileBundle['scores'];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ scores }) => {
  if (!scores) return null;

  const data = [
    { subject: 'Backend', A: scores.backend?.score ?? 0 },
    { subject: 'Frontend', A: scores.frontend?.score ?? 0 },
    { subject: 'AI/ML', A: scores.ai?.score ?? 0 },
    { subject: 'DevOps', A: scores.devops?.score ?? 0 },
    { subject: 'Testing', A: scores.testing?.score ?? 0 },
    { subject: 'Security', A: scores.security?.score ?? 0 },
  ];

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#d8e0d9" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#617066', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#617066' }} />
          <Radar
            name="Developer Skill Profile"
            dataKey="A"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
