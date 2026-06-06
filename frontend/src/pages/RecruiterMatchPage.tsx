import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api, type JobMatch } from '../services/api';
import { AlertCircle, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecruiterMatchPage: React.FC = () => {
  const { username: routeUsername } = useParams<{ username?: string }>();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState(routeUsername || '');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routeUsername) {
      setUsername(routeUsername);
    }
  }, [routeUsername]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in or register to compare candidates against job descriptions.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const matchResult = await api.jobMatch(username.trim(), jobDescription.trim());
      setResult(matchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to match job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="panel matcher-form-panel">
        <p className="eyebrow">Recruiter Mode</p>
        <h1>Compare a developer against a job description.</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          GitIntel extracts skills and frameworks from the JD and parses them against the developer's public evidence.
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
            Job description
            <textarea
              required
              minLength={30}
              rows={8}
              placeholder="Paste required skills, preferred stack, or full job post details..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={loading}
            />
          </label>
          
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Analyzing & matching...' : 'Generate Match Analysis'}
          </button>
        </form>
        
        {error && (
          <p className="error message-box" style={{ marginTop: 16 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </p>
        )}
      </section>

      {result && (
        <section className="match-result-section animate-fade-in" style={{ marginTop: 24 }}>
          <div className="big-score-container">
            <div className="big-score">
              <span>{result.matchPercentage}%</span>
              <p className="big-score-title">Job Match Rating</p>
            </div>
            <div className="match-recommendation-panel">
              <h3>Hiring Recommendation</h3>
              <p className="recommendation-text">{result.hiringRecommendation}</p>
            </div>
          </div>
          
          <div className="two-col" style={{ marginTop: 24 }}>
            <div className="panel strengths-panel">
              <h2>Strengths & Matches</h2>
              <ul className="clean-list strengths-list">
                {result.strengths.map((item, idx) => (
                  <li key={idx} className="strength-item">
                    <CheckCircle size={16} color="var(--accent)" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="panel missing-skills-panel">
              <h2>Missing Required Skills</h2>
              <p className="muted" style={{ marginBottom: 16 }}>
                These skills were extracted from the JD but have no public repo evidence.
              </p>
              <div className="chips">
                {result.missingSkills.map((skill) => (
                  <span key={skill} className="tech-chip missing">{skill}</span>
                ))}
                {result.missingSkills.length === 0 && (
                  <span className="no-missing-skills">
                    <CheckCircle size={14} color="var(--accent)" style={{ marginRight: 6 }} />
                    No missing required skills detected!
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default RecruiterMatchPage;
