import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type ProfileBundle } from '../services/api';
import RepositoryCard from '../components/RepositoryCard';
import RoleMatchCard from '../components/RoleMatchCard';
import ScoreCard from '../components/ScoreCard';
import SkillRadarChart from '../components/SkillRadarChart';
import ComplexityDistribution from '../components/ComplexityDistribution';
import ContributionTimeline from '../components/ContributionTimeline';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { FileText, Download, Share2, Printer, Search, AlertCircle, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { username, token } = useParams<{ username?: string; token?: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState('');
  const [bundle, setBundle] = useState<ProfileBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const scoreLabels: Record<string, string> = {
    backend: 'Backend',
    frontend: 'Frontend',
    ai: 'AI/ML',
    devops: 'DevOps',
    testing: 'Testing',
    security: 'Security',
    impact: 'Open Source Impact',
    consistency: 'Consistency',
    collaboration: 'Collaboration'
  };

  const loadData = async (identifier: string, isToken: boolean) => {
    setLoading(true);
    setError('');
    try {
      // If sharing token, use token. Otherwise use username.
      const result = await api.profile(identifier);
      setBundle(result);
      setQuery(result.profile.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile');
      setBundle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData(token, true);
    } else if (username) {
      loadData(username, false);
    } else {
      // Fallback: If no username is in route, but we are authenticated, we could load a default or prompt.
      setBundle(null);
    }
  }, [username, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    navigate(`/dashboard/${cleanQuery}`);
  };

  const handleDownloadJSON = async () => {
    if (!bundle) return;
    try {
      const data = await api.report(bundle.profile.username);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gitintel_${bundle.profile.username}_report.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download JSON report');
    }
  };

  const handleShareLink = () => {
    if (!bundle) return;
    const shareUrl = `${window.location.origin}/share/${bundle.profile.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Distinct technologies cloud
  const technologies = useMemo(() => {
    if (!bundle) return [];
    return Array.from(new Set(bundle.repositories.flatMap((repo) => repo.technologies))).slice(0, 24);
  }, [bundle]);

  return (
    <div className="page dashboard-page">
      {/* Search Bar / Toolbar */}
      <div className="dashboard-toolbar-row no-print">
        <form className="toolbar" onSubmit={handleSearch}>
          <input
            placeholder="Load analyzed username (e.g. facebook)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="primary" type="submit">
            <Search size={16} />
            <span>Load</span>
          </button>
        </form>
        
        {bundle && (
          <div className="export-actions">
            <button className="ghost flex-btn" onClick={handleDownloadJSON} title="Download JSON Report">
              <Download size={16} />
              <span>JSON</span>
            </button>
            <button className="ghost flex-btn" onClick={handleShareLink} title="Copy Public Share Link">
              <Share2 size={16} />
              <span>{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>
            <button className="ghost flex-btn" onClick={handlePrint} title="Print PDF Report">
              <Printer size={16} />
              <span>Print PDF</span>
            </button>
          </div>
        )}
      </div>

      {loading && <p className="muted no-print">Loading developer intelligence data...</p>}
      
      {error && (
        <p className="error message-box no-print">
          <AlertCircle size={16} />
          <span>{error}</span>
        </p>
      )}

      {!bundle && !loading && !error && (
        <div className="dashboard-empty-state panel no-print">
          <FileText size={48} className="empty-icon" />
          <h2>No Profile Loaded</h2>
          <p className="lede">
            Enter a GitHub username in the input above, or head back to the homepage to kick off a new AI analysis session.
          </p>
          <button className="primary" onClick={() => navigate('/')}>
            Go to Analyze
          </button>
        </div>
      )}

      {bundle && (
        <div className="dashboard-content">
          {/* Profile Hero Header */}
          <section className="profile-hero">
            <img src={bundle.profile.avatarUrl} alt={bundle.profile.username} className="avatar-img" />
            <div className="hero-info">
              <p className="eyebrow">Analysis Dashboard</p>
              <h1>{bundle.profile.name || bundle.profile.username}</h1>
              <p className="lede">{bundle.profile.bio || bundle.insights.summary}</p>
              <div className="repo-meta">
                <span>{bundle.profile.followers} followers</span>
                <span>{bundle.profile.publicRepos} public repos</span>
                <span>Analyzed {new Date(bundle.profile.analyzedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          {/* Scores Overview */}
          <section className="dashboard-section" style={{ marginTop: 24 }}>
            <div className="section-title-row">
              <h2>Evidence-Based Scores</h2>
              <span className="info-badge">Normalized to 100</span>
            </div>
            
            <div className="scores-layout">
              {/* Radar Chart Panel */}
              <div className="panel radar-panel">
                <h3>Skill Radar Chart</h3>
                <SkillRadarChart scores={bundle.scores} />
              </div>
              
              {/* Score Cards Grid */}
              <div className="grid scores">
                {Object.entries(bundle.scores)
                  .filter(([key]) => key in scoreLabels)
                  .map(([key, category]) => (
                    <ScoreCard key={key} label={scoreLabels[key]} category={category} />
                  ))}
              </div>
            </div>
          </section>

          {/* Technology Cloud & Career intelligence */}
          <section className="two-col dashboard-section" style={{ marginTop: 24 }}>
            <div className="panel tech-cloud-panel">
              <h2>Technology Cloud</h2>
              <p className="muted" style={{ marginBottom: 16 }}>Distinct frameworks, languages, and tools extracted from source contents.</p>
              <div className="chips large">
                {technologies.map((tech) => (
                  <span key={tech} className="tech-chip large">{tech}</span>
                ))}
              </div>
            </div>

            <div className="panel career-intel-panel">
              <h2>Career Intelligence</h2>
              <p className="muted" style={{ marginBottom: 16 }}>Predicted role alignments calculated from complexity and framework coverage.</p>
              <div className="role-list">
                {bundle.insights.recommendedRoles.slice(0, 3).map((role) => (
                  <RoleMatchCard key={role.role} role={role} />
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Visualizations (Timeline & Complexity Distribution) */}
          <section className="two-col dashboard-section" style={{ marginTop: 24 }}>
            <div className="panel complexity-dist-panel">
              <h2>Complexity Distribution</h2>
              <p className="muted" style={{ marginBottom: 16 }}>Comparison of candidate's top repositories by architectural complexity.</p>
              <ComplexityDistribution repositories={bundle.repositories} />
            </div>

            <div className="panel timeline-panel">
              <h2>Activity Timeline</h2>
              <p className="muted" style={{ marginBottom: 16 }}>Sampled code commits grouped chronologically over active periods.</p>
              <ContributionTimeline repositories={bundle.repositories} />
            </div>
          </section>

          {/* Heatmap & Strengths */}
          <section className="dashboard-section" style={{ marginTop: 24 }}>
            <ActivityHeatmap repositories={bundle.repositories} />
          </section>

          <section className="two-col dashboard-section" style={{ marginTop: 24 }}>
            <div className="panel strengths-panel">
              <h2>Strengths & Highlights</h2>
              <ul className="clean-list highlights-list">
                {bundle.insights.strengths.map((item, idx) => (
                  <li key={idx} className="highlight-item">
                    <CheckCircle size={16} color="var(--accent)" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel evidence-panel">
              <h2>Evidence Explorer</h2>
              <p className="muted" style={{ marginBottom: 16 }}>Sample repository metrics supporting the developer assessment scores.</p>
              <ul className="clean-list evidence-list">
                {bundle.repositories.slice(0, 5).map((repo) => (
                  <li key={repo.name} className="evidence-explorer-item">
                    <strong className="repo-name">{repo.name}</strong>
                    <div className="repo-stats-summary">
                      {repo.evidence.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="mini-stat-badge">
                          {item.label}: <strong>{item.value}</strong>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Top Repositories */}
          <section className="dashboard-section" style={{ marginTop: 24 }}>
            <h2>Top Repositories</h2>
            <p className="muted" style={{ marginBottom: 16 }}>Public portfolios analysed by GitIntel, showing languages, stars, and code complexity.</p>
            <div className="repo-grid">
              {bundle.repositories.slice(0, 6).map((repo) => (
                <RepositoryCard key={repo.fullName} repository={repo} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
