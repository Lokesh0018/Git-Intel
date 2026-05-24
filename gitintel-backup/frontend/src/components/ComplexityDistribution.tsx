import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell, CartesianGrid } from 'recharts';
import type { ProfileBundle } from '../services/api';

interface ComplexityDistributionProps {
  repositories: ProfileBundle['repositories'];
}

const ComplexityDistribution: React.FC<ComplexityDistributionProps> = ({ repositories }) => {
  if (!repositories || repositories.length === 0) {
    return <p className="muted">No repository data available to display.</p>;
  }

  // Take the top 8 repositories by complexity score
  const data = [...repositories]
    .sort((a, b) => b.complexityScore - a.complexityScore)
    .slice(0, 8)
    .map((repo) => ({
      name: repo.name.length > 15 ? `${repo.name.slice(0, 12)}...` : repo.name,
      fullName: repo.name,
      complexity: repo.complexityScore,
      stars: repo.stars,
      language: repo.language || 'Unknown'
    }));

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef3ef" />
          <XAxis dataKey="name" tick={{ fill: '#617066', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#617066', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px' }}
            labelFormatter={(value, items) => {
              const item = items[0]?.payload;
              return item ? item.fullName : value;
            }}
            formatter={(value, name, item) => {
              if (name === 'complexity') {
                return [`Complexity: ${value}/100`, `Language: ${item.payload.language}`];
              }
              return [value, name];
            }}
          />
          <Bar dataKey="complexity" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              // Alternate bar color gradients
              const colors = ['#166b5c', '#2d5f9a', '#c84b31', '#17211b'];
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplexityDistribution;
