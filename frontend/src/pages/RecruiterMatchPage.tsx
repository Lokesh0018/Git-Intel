import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type JobMatch } from '../services/api';
import { AlertCircle, CheckCircle, ShieldAlert, Sparkles, FileText, Clipboard, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Sample templates for quick testing
const JD_TEMPLATES = {
  react: {
    title: 'Senior Frontend Developer (React)',
    content: `We are looking for a Senior Frontend Engineer proficient in React 18, TypeScript, and state management solutions (Redux or Zustand). Experience with bundlers like Vite/Webpack and modern responsive layout systems (CSS/Tailwind) is required. Ideal candidates should write automated unit tests using Jest/React Testing Library, build highly accessible dashboards, and optimize load performance.`
  },
  backend: {
    title: 'Node.js Backend Engineer',
    content: `Looking for a Backend Developer skilled in Node.js, Express, and databases (MongoDB, PostgreSQL, or Redis). You will design RESTful APIs, manage schema structures via Mongoose/Sequelize, implement security modules (CORS, Helmet, JWT auth validation), configure environment configurations, and handle static caching for asynchronous file streams.`
  },
  devops: {
    title: 'Cloud DevOps Architect',
    content: `Seeking a DevOps Engineer experienced in AWS, GCP, and Docker containerization. Must have knowledge of cloud orchestration (Kubernetes), infrastructure as code (Terraform), continuous integration pipelines (GitHub Actions, Jenkins), server reverse proxies (Nginx), and deployment management configurations.`
  }
};

const RecruiterMatchPage: React.FC = () => {
  const { username: routeUsername } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const { activeUsername, setActiveUsername } = useAuth();

  const [username, setUsername] = useState(routeUsername || '');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeUsername) {
      setUsername(routeUsername);
    } else if (activeUsername) {
      navigate(`/match/${activeUsername}`, { replace: true });
    }
  }, [routeUsername, activeUsername, navigate]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = username.trim();
    const targetJD = jobDescription.trim();
    if (!targetUser || !targetJD) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const matchResult = await api.jobMatch(targetUser, targetJD);
      setResult(matchResult);
      setActiveUsername(targetUser);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Job match analysis generated!' } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete job match');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (key: keyof typeof JD_TEMPLATES) => {
    setJobDescription(JD_TEMPLATES[key].content);
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Loaded ${JD_TEMPLATES[key].title} template` } }));
  };

  return (
    <div className="page match-page animate-fade-in">
      <header className="profile-hero" style={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05), rgba(108, 99, 255, 0.05)), var(--surface)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255, 255, 255, 0.02)', border: 'var(--glass-border)', display: 'grid', placeItems: 'center', color: 'var(--accent-4)' }}>
          <Sparkles size={32} className="animate-pulse-glow" />
        </div>
        <div className="hero-info" style={{ marginLeft: -12 }}>
          <p className="eyebrow" style={{ color: 'var(--accent-4)' }}>Recruiter Workspace Mode</p>
          <h1>AI Job Matching Engine</h1>
          <p className="lede">Compare developer codebase evidence against custom job descriptions instantly.</p>
        </div>
      </header>

      {/* Main Two Column layout */}
      <section className="two-col" style={{ marginTop: 24 }}>
        
        {/* Left: Input Form and Templates */}
        <div className="panel matcher-form-panel">
          <h2>Compare Candidate</h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Input the candidate's GitHub handle and paste the job description text to parse requirements.
          </p>

          <form className="stack" onSubmit={handleMatch}>
            <label>
              GitHub username
              <input
                required
                placeholder="e.g. facebook"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </label>

            <label>
              Job description details
              <textarea
                required
                minLength={30}
                rows={10}
                placeholder="Paste the required skills, responsibilities, or stack requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </label>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Analyzing & Matching Code...' : 'Run Match Evaluation'}
            </button>
          </form>

          {/* Quick suggestions templates */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: 'var(--line)' }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>Load Quick Test Templates:</span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="ghost flex-btn" onClick={() => loadTemplate('react')} style={{ fontSize: 11, minHeight: 32 }}>
                React Frontend
              </button>
              <button className="ghost flex-btn" onClick={() => loadTemplate('backend')} style={{ fontSize: 11, minHeight: 32 }}>
                Node Backend
              </button>
              <button className="ghost flex-btn" onClick={() => loadTemplate('devops')} style={{ fontSize: 11, minHeight: 32 }}>
                AWS DevOps
              </button>
            </div>
          </div>

          {error && (
            <p className="error message-box" style={{ marginTop: 16 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Right: Results comparison panel */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
          {result ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Glowing big circular rating */}
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: 'rgba(255,255,255,0.015)', border: 'var(--glass-border)', padding: 20, borderRadius: 12 }}>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-4), var(--accent))',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#080B12',
                  boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)'
                }}>
                  <strong style={{ fontSize: 26, fontFamily: 'Outfit' }}>{result.matchPercentage}%</strong>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Candidate Fit Rating</h3>
                  <p className="muted" style={{ fontSize: 12, margin: '4px 0 0 0' }}>Computed by comparing parsed requirements with public repositories.</p>
                </div>
              </div>

              {/* Recommendation Panel */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: 'var(--glass-border)', borderRadius: 12, padding: 20 }}>
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>AI Hiring Recommendation</strong>
                <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '8px 0 0 0' }}>
                  {result.hiringRecommendation}
                </p>
              </div>

              {/* Matched skills */}
              <div>
                <strong style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Matched Codebase Evidence</strong>
                <div className="chips">
                  {result.strengths.map((strength) => (
                    <span key={strength} className="tech-chip" style={{ background: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.2)', color: 'var(--success)' }}>
                      {strength}
                    </span>
                  ))}
                  {result.strengths.length === 0 && (
                    <span className="muted" style={{ fontSize: 13 }}>No direct codebase matches detected.</span>
                  )}
                </div>
              </div>

              {/* Missing skills */}
              <div>
                <strong style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Missing Stack Requirements</strong>
                <div className="chips">
                  {result.missingSkills.map((skill) => (
                    <span key={skill} className="tech-chip missing">
                      {skill}
                    </span>
                  ))}
                  {result.missingSkills.length === 0 && (
                    <span className="tech-chip" style={{ background: 'rgba(0, 230, 118, 0.08)', borderColor: 'rgba(0, 230, 118, 0.2)', color: 'var(--success)' }}>
                      No missing requirements detected!
                    </span>
                  )}
                </div>
              </div>

              {/* Direct inspect navigation */}
              <button
                className="ghost flex-btn"
                onClick={() => navigate(`/dashboard/${username}`)}
                style={{ width: '100%', marginTop: 8 }}
              >
                <span>Inspect Repository Details</span>
                <ArrowRight size={14} />
              </button>

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }} className="muted">
              <FileText size={48} style={{ color: 'var(--line)', marginBottom: 16 }} />
              <h3>No Evaluation Generated</h3>
              <p style={{ fontSize: 13, maxWidth: 300, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                Fill in the forms on the left and submit to generate matching metrics, strengths, and missing stack requirements.
              </p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default RecruiterMatchPage;
