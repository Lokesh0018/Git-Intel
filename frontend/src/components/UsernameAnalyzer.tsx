import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AlertCircle, Play } from 'lucide-react';

const UsernameAnalyzer: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = username.trim();
    if (!targetUsername) return;

    setLoading(true);
    setError('');
    try {
      const bundle = await api.analyze(targetUsername);
      navigate(`/dashboard/${bundle.profile.username}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="analyzer">
      <div>
        <p className="eyebrow">Evidence-based GitHub screening</p>
        <h1>Analyze a developer from public repository signals.</h1>
        <p className="lede">
          Scores are tied to repositories, technologies, activity, impact, and explicit evidence so recruiters can inspect the "why" behind every result.
        </p>
      </div>
      <form className="search-row" onSubmit={handleAnalyze}>
        <input
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoComplete="off"
        />
        <button className="primary" type="submit" disabled={loading}>
          {loading ? (
            'Analyzing...'
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </form>
      {error && (
        <p className="error message-box">
          <AlertCircle size={16} />
          <span>{error}</span>
        </p>
      )}
    </section>
  );
};

export default UsernameAnalyzer;
