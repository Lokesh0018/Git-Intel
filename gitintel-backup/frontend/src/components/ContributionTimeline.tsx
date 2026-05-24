import React from 'react';
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, CartesianGrid } from 'recharts';
import type { ProfileBundle } from '../services/api';

interface ContributionTimelineProps {
  repositories: ProfileBundle['repositories'];
}

const ContributionTimeline: React.FC<ContributionTimelineProps> = ({ repositories }) => {
  if (!repositories || repositories.length === 0) {
    return <p className="muted">No contribution data available to display.</p>;
  }

  // Create a timeline by grouping commits by month
  // We'll extract monthly commit metrics based on pushedAt dates of repos.
  const monthlyData: Record<string, { month: string; commits: number; complexitySum: number; count: number }> = {};

  repositories.forEach((repo) => {
    // Find pushes (fallback to current date if missing, or ignore)
    // In our system, Repository model contains pushedAt field. Let's check api.ts bundle:
    // Wait, let's look at the Repository properties. It has `pushedAt`?
    // Let's check what is in backend `Repository.ts` schema:
    // It has `pushedAt`! In frontend/services/api.ts, we omitted pushedAt from the ProfileBundle type,
    // but the backend returns it. We can cast repo as any, or update our api.ts type to include pushedAt: string.
    // Let's updated api.ts type in memory or cast it to any. Let's make sure it handles dates.
    const dateStr = (repo as any).pushedAt;
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;

    const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        commits: 0,
        complexitySum: 0,
        count: 0
      };
    }
    monthlyData[monthKey].commits += repo.commits ?? 0;
    monthlyData[monthKey].complexitySum += repo.complexityScore ?? 0;
    monthlyData[monthKey].count += 1;
  });

  // Sort chronologically by date
  const data = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  // Fallback: If no timeline data could be parsed, map individual repos by commits
  if (data.length === 0) {
    const topCommits = [...repositories]
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 8)
      .map((repo) => ({
        month: repo.name.length > 12 ? `${repo.name.slice(0, 10)}...` : repo.name,
        commits: repo.commits
      }));
    
    return (
      <div className="chart-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <AreaChart data={topCommits} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef3ef" />
            <XAxis dataKey="month" tick={{ fill: '#617066', fontSize: 11 }} />
            <YAxis tick={{ fill: '#617066', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="commits" stroke="var(--accent-3)" fill="var(--accent-3)" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef3ef" />
          <XAxis dataKey="month" tick={{ fill: '#617066', fontSize: 11 }} />
          <YAxis tick={{ fill: '#617066', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px' }} />
          <Area
            type="monotone"
            dataKey="commits"
            name="Sampled Commits"
            stroke="var(--accent-3)"
            fill="var(--accent-3)"
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContributionTimeline;
