import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { storage } from '../services/storage';

export default function ApiSetupPage() {
  const [token, setToken] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const resetTimestamp = location.state?.resetTime;

  let resetTimeMessage = '';
  if (resetTimestamp) {
    const resetDate = new Date(parseInt(resetTimestamp, 10) * 1000);
    resetTimeMessage = `If you choose not to add a token, your limit will automatically reset at ${resetDate.toLocaleTimeString()}.`;
  }

  useEffect(() => {
    const settings = storage.getSettings();
    if (settings.githubToken) {
      setToken(settings.githubToken);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = storage.getSettings();
    settings.githubToken = token;
    storage.saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      navigate(-1); // Go back to the previous page (likely the analysis page or home)
    }, 1500);
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card fade-in-up" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--warning-color)' }}>
          <AlertTriangle size={48} />
        </div>
        
        <h2 className="text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
          GitHub API Rate Limit Reached
        </h2>
        
        <div className="mb-6" style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <p className="mb-4">
            <strong>Why it's happening:</strong> The GitHub API heavily rate-limits unauthenticated requests (usually to just 60 requests per hour per IP address). Because GitIntel makes multiple API calls to fetch profile details, repositories, and package files, you've hit this limit.
          </p>
          <p className="mb-4">
            <strong>How to fix it:</strong> You need to provide a GitHub Personal Access Token. This will attach the token to your API requests and raise your rate limit significantly (up to 5,000 requests per hour).
          </p>
          <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Go to your GitHub account settings -{'>'} Developer settings -{'>'} Personal access tokens -{'>'} Tokens (classic).</li>
            <li>Generate a new token (it doesn't need any special scopes for public data, but <code>public_repo</code> is usually safe).</li>
            <li>Paste the token below.</li>
          </ol>
          {resetTimeMessage && (
            <p style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              ⏳ <strong>Notice:</strong> {resetTimeMessage}
            </p>
          )}
        </div>

        {saved ? (
          <div className="text-center fade-in" style={{ padding: '2rem 0' }}>
            <CheckCircle size={48} color="var(--success-color)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: 'var(--success-color)' }}>Token Saved Successfully!</h3>
            <p className="text-secondary mt-2">Redirecting you back...</p>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group mb-6">
              <label className="form-label">GitHub Personal Access Token</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="ghp_xxxxxxxxxxxx" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <p className="text-sm text-secondary mt-2">
                The token is stored locally in your browser and never sent to any servers.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button type="submit" className="btn" style={{ flex: 1 }}>Save Token & Continue</button>
              <button type="button" onClick={() => navigate('/')} className="btn btn-outline" style={{ flex: 1 }}>Go Home</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
