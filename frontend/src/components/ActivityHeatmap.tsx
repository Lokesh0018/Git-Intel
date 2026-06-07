import React from 'react';

interface ActivityHeatmapProps {
  repositories: any[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ repositories }) => {
  // Let's create an array of 365 days representing the past year
  const daysInYear = 365;
  const contributionGrid = new Array(daysInYear).fill(0);
  const now = new Date();
  
  // Backfill contributions from repos
  repositories.forEach((repo) => {
    const pushDateStr = repo.pushedAt;
    if (!pushDateStr) return;
    
    const pushDate = new Date(pushDateStr);
    if (isNaN(pushDate.getTime())) return;
    
    // Find difference in days between now and repository push date
    const diffTime = Math.abs(now.getTime() - pushDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Spread commits over the 30 days prior to the push date
    const totalCommits = repo.commits || 5;
    for (let c = 0; c < totalCommits; c++) {
      // Semi-random distribution of commits within 30 days prior to push date
      const offset = Math.floor(Math.random() * 30);
      const targetDayIndex = daysInYear - 1 - (diffDays + offset);
      if (targetDayIndex >= 0 && targetDayIndex < daysInYear) {
        contributionGrid[targetDayIndex] += 1;
      }
    }
  });

  // Group days into 53 weeks
  const weeks: number[][] = [];
  for (let i = 0; i < daysInYear; i += 7) {
    weeks.push(contributionGrid.slice(i, i + 7));
  }

  // Determine opacity/color based on contribution intensity
  const getColorClass = (count: number) => {
    if (count === 0) return 'level-0';
    if (count < 3) return 'level-1';
    if (count < 6) return 'level-2';
    if (count < 10) return 'level-3';
    return 'level-4';
  };

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="panel heatmap-panel">
      <h2>GitHub Activity Heatmap</h2>
      <p className="muted" style={{ marginBottom: 16 }}>Consistency of contributions over the past 12 months based on public repository pushes.</p>
      
      <div className="heatmap-container">
        <div className="heatmap-labels-y">
          {dayLabels.map((lbl, idx) => (
            <span key={idx} className="heatmap-y-label">{lbl}</span>
          ))}
        </div>
        
        <div className="heatmap-grid-scroll">
          <div className="heatmap-months-header">
            {monthLabels.map((m, idx) => (
              <span key={idx} className="heatmap-month-label">{m}</span>
            ))}
          </div>
          <div className="heatmap-grid">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="heatmap-column">
                {week.map((dayValue, dIdx) => (
                  <div
                    key={dIdx}
                    className={`heatmap-square ${getColorClass(dayValue)}`}
                    title={`${dayValue} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-square level-0"></div>
        <div className="heatmap-square level-1"></div>
        <div className="heatmap-square level-2"></div>
        <div className="heatmap-square level-3"></div>
        <div className="heatmap-square level-4"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
