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
import ErrorStates from '../components/ErrorStates';
import { FileText, Download, Share2, Printer, Search, AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, XCircle, Award, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { username, token } = useParams<{ username?: string; token?: string }>();
  const navigate = useNavigate();
  const { activeUsername, setActiveUsername } = useAuth();

  const [query, setQuery] = useState('');
  const [bundle, setBundle] = useState<ProfileBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  // Filters for repositories table
  const [repoSearch, setRepoSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');

  const scoreLabels: Record<string, string> = {
    backend: 'Backend',
    frontend: 'Frontend',
    ai: 'AI/ML',
    devops: 'DevOps',
    testing: 'Testing',
    security: 'Security',
    impact: 'OS Impact',
    consistency: 'Consistency',
    collaboration: 'Collaboration'
  };

  const loadData = async (identifier: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.profile(identifier);
      setBundle(result);
      setQuery(result.profile.username);
      setActiveUsername(result.profile.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile');
      setBundle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username && !token && activeUsername) {
      navigate(`/dashboard/${activeUsername}`, { replace: true });
    }
  }, [username, token, activeUsername, navigate]);

  useEffect(() => {
    if (token) {
      loadData(token);
    } else if (username) {
      loadData(username);
    } else {
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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'JSON report downloaded successfully!' } }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to download report' } }));
    }
  };

  const handleShareLink = () => {
    if (!bundle) return;
    const shareUrl = `${window.location.origin}/share/${bundle.profile.shareToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Share link copied to clipboard!' } }));
      setTimeout(() => setShareCopied(false), 3000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Compute overall developer score (flagship feature)
  const overallScore = useMemo(() => {
    if (!bundle) return 0;
    const scores = Object.values(bundle.scores).map((s) => s.score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((acc, v) => acc + v, 0) / scores.length);
  }, [bundle]);

  // Distinct technologies cloud
  const technologies = useMemo(() => {
    if (!bundle) return [];
    return Array.from(new Set(bundle.repositories.flatMap((repo) => repo.technologies))).slice(0, 24);
  }, [bundle]);

  // Languages list for repository filter
  const languagesList = useMemo(() => {
    if (!bundle) return [];
    return Array.from(new Set(bundle.repositories.map((r) => r.language).filter(Boolean))) as string[];
  }, [bundle]);

  // Filtered repositories for table
  const filteredRepositories = useMemo(() => {
    if (!bundle) return [];
    return bundle.repositories.filter((repo) => {
      const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(repoSearch.toLowerCase()));
      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
      const matchesComplexity = complexityFilter === 'all' || 
        (complexityFilter === 'high' && repo.complexityScore >= 70) ||
        (complexityFilter === 'medium' && repo.complexityScore >= 40 && repo.complexityScore < 70) ||
        (complexityFilter === 'low' && repo.complexityScore < 40);

      return matchesSearch && matchesLanguage && matchesComplexity;
    });
  }, [bundle, repoSearch, languageFilter, complexityFilter]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
        <p className="muted" style={{ padding: 40, textAlign: 'center' }}>Loading developer intelligence data...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorStates type="failed" customMessage={error} onRetry={() => username && loadData(username)} />;
  }

  if (!bundle) {
    return (
      <div className="page" style={{ padding: '40px 0' }}>
        <div className="dashboard-toolbar-row" style={{ marginBottom: 32 }}>
          <form className="toolbar" onSubmit={handleSearch}>
            <input
              placeholder="Search candidate report (e.g. facebook)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="primary" type="submit">
              <Search size={16} />
              <span>Load Report</span>
            </button>
          </form>
        </div>
        <ErrorStates type="empty" />
      </div>
    );
  }

  return (
    <div className="page dashboard-page animate-fade-in">
      
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
      </div>

      {/* Flagship Content */}
      <div className="dashboard-content">
        
        {/* Profile Hero Header */}
        <section className="profile-hero">
          <img src={bundle.profile.avatarUrl} alt={bundle.profile.username} className="avatar-img" />
          <div className="hero-info">
            <p className="eyebrow">Developer Report Card</p>
            <h1>{bundle.profile.name || bundle.profile.username}</h1>
            <p className="lede">{bundle.profile.bio || bundle.insights.summary}</p>
            <div className="repo-meta">
              <span>{bundle.profile.followers} followers</span>
              <span>{bundle.profile.publicRepos} public repos</span>
              <span>Analyzed {new Date(bundle.profile.analyzedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        {/* Circular Score Meter & Category radar chart */}
        <section className="dashboard-section" style={{ marginTop: 32 }}>
          <div className="two-col">
            
            {/* Left: Overall score circle */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
              <h3>Developer Score</h3>
              <p className="muted" style={{ fontSize: 11, textAlign: 'center', margin: 0 }}>Average normalized index across core software categories.</p>
              
              <div className="circular-progress-container">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="58" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="none" />
                  <circle
                    cx="70"
                    cy="70"
                    r="58"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 - (364.4 * overallScore) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="circular-progress-text">
                  <span className="circular-progress-score">{overallScore}</span>
                  <span className="circular-progress-label">Index</span>
                </div>
              </div>

              <span className="tech-chip" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--accent)', fontWeight: 600 }}>
                Verified Profile
              </span>
            </div>

            {/* Right: Radar Chart */}
            <div className="panel radar-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>Skill Radar Chart</h3>
              <p className="muted" style={{ fontSize: 11, marginBottom: 16 }}>Relative balance across system engineering skill dimensions.</p>
              <div style={{ flex: 1, minHeight: 0 }}>
                <SkillRadarChart scores={bundle.scores} />
              </div>
            </div>

          </div>
        </section>

        {/* Grid Category Scores */}
        <section className="dashboard-section" style={{ marginTop: 24 }}>
          <h2>Category Breakdown</h2>
          <div className="grid scores">
            {Object.entries(bundle.scores)
              .filter(([key]) => key in scoreLabels)
              .map(([key, category]) => (
                <ScoreCard key={key} label={scoreLabels[key]} category={category} />
              ))}
          </div>
        </section>

        {/* Technology cloud & Career intelligence */}
        <section className="two-col dashboard-section" style={{ marginTop: 24 }}>
          <div className="panel tech-cloud-panel">
            <h2>Technology Verification</h2>
            <p className="muted" style={{ marginBottom: 16 }}>Frameworks and engines extracted from static configurator files.</p>
            <div className="chips large">
              {technologies.map((tech) => (
                <span key={tech} className="tech-chip large">{tech}</span>
              ))}
            </div>
          </div>

          <div className="panel career-intel-panel">
            <h2>Recommended Roles</h2>
            <p className="muted" style={{ marginBottom: 16 }}>Calculated candidate suitability based on codebase profile.</p>
            <div className="role-list">
              {bundle.insights.recommendedRoles.slice(0, 3).map((role) => (
                <RoleMatchCard key={role.role} role={role} />
              ))}
            </div>
          </div>
        </section>

        {/* Activity & Complexity distribution */}
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

        {/* Git Contribution Heatmap */}
        <section className="dashboard-section" style={{ marginTop: 24 }}>
          <ActivityHeatmap repositories={bundle.repositories} />
        </section>

        {/* Strengths & Weaknesses Grids */}
        <section className="two-col dashboard-section" style={{ marginTop: 24 }}>
          <div className="panel strengths-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
              <h2 style={{ margin: 0 }}>Strengths & Highlights</h2>
            </div>
            <ul className="clean-list highlights-list">
              {bundle.insights.strengths.map((item, idx) => (
                <li key={idx} className="highlight-item">
                  <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel weaknesses-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <XCircle size={20} style={{ color: 'var(--accent-2)' }} />
              <h2 style={{ margin: 0 }}>Weaknesses & Risks</h2>
            </div>
            <ul className="clean-list highlights-list">
              {bundle.insights.weaknesses.map((item, idx) => (
                <li key={idx} className="highlight-item">
                  <XCircle size={16} style={{ color: 'var(--accent-2)', flexShrink: 0, marginTop: 2 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Repository Search, Filter and Table */}
        <section className="panel dashboard-section" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0 }}>Repository Intelligence Explorer</h2>
              <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Filter and inspect individual codebase details and AST score evidence.</p>
            </div>

            {/* Filters row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--muted)' }} />
                <input
                  placeholder="Search repository..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  style={{ padding: '8px 12px 8px 32px', fontSize: 13, background: 'rgba(0,0,0,0.25)', border: 'var(--glass-border)', borderRadius: 8, width: 180 }}
                />
              </div>

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.25)', border: 'var(--glass-border)', borderRadius: 8, color: 'var(--ink)' }}
              >
                <option value="all">All Languages</option>
                {languagesList.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>

              <select
                value={complexityFilter}
                onChange={(e) => setComplexityFilter(e.target.value)}
                style={{ padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.25)', border: 'var(--glass-border)', borderRadius: 8, color: 'var(--ink)' }}
              >
                <option value="all">All Complexities</option>
                <option value="high">High (&ge;70)</option>
                <option value="medium">Medium (40-69)</option>
                <option value="low">Low (&lt;40)</option>
              </select>
            </div>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Repository Name</th>
                  <th>Primary Language</th>
                  <th>Complexity</th>
                  <th>Impact Stars</th>
                  <th>Framework Evidence</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepositories.map((repo) => (
                  <tr key={repo.fullName}>
                    <td>
                      <strong style={{ color: 'var(--ink)', display: 'block' }}>{repo.name}</strong>
                      <span className="muted" style={{ fontSize: 11, textOverflow: 'ellipsis', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 300 }}>{repo.description || 'No description provided.'}</span>
                    </td>
                    <td>
                      <span className="tech-chip" style={{ fontSize: 11 }}>{repo.language || 'Other'}</span>
                    </td>
                    <td>
                      <strong style={{ color: repo.complexityScore >= 70 ? 'var(--accent)' : repo.complexityScore >= 40 ? 'var(--accent-3)' : 'var(--muted)', fontFamily: 'Outfit' }}>
                        {repo.complexityScore}
                      </strong>
                    </td>
                    <td>
                      <span className="muted" style={{ fontSize: 12 }}>{repo.stars} stars</span>
                    </td>
                    <td>
                      <div className="chips" style={{ marginTop: 0, gap: 4 }}>
                        {repo.technologies.slice(0, 3).map((tech) => (
                          <span key={tech} className="tech-chip" style={{ fontSize: 9, padding: '2px 6px' }}>{tech}</span>
                        ))}
                        {repo.technologies.length > 3 && (
                          <span className="tech-chip" style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.01)' }}>
                            +{repo.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="ghost"
                        onClick={() => navigate(`/match/${bundle.profile.username}`)}
                        style={{ minHeight: 28, padding: '0 8px', fontSize: 11, borderRadius: 6 }}
                      >
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRepositories.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 32 }} className="muted">
                      No repositories match the search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
