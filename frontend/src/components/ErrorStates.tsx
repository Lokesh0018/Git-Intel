import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX, FolderGit2, AlertTriangle, XCircle, FileText, ArrowLeft, RefreshCw } from 'lucide-react';

export type ErrorStateType = 'not-found' | 'no-repos' | 'rate-limit' | 'failed' | 'empty';

interface ErrorStatesProps {
  type: ErrorStateType;
  customMessage?: string;
  onRetry?: () => void;
}

const ErrorStates: React.FC<ErrorStatesProps> = ({ type, customMessage, onRetry }) => {
  const navigate = useNavigate();

  const configs = {
    'not-found': {
      icon: <UserX size={48} className="text-danger" />,
      title: 'GitHub Profile Not Found',
      description: customMessage || 'We searched high and low, but that username doesn\'t exist on public GitHub. Double check the spelling and try again.',
      action: (
        <button className="primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </button>
      )
    },
    'no-repos': {
      icon: <FolderGit2 size={48} className="text-warning" />,
      title: 'No Public Repositories Found',
      description: customMessage || 'This GitHub user profile exists, but it has no public repositories. GitIntel requires public code repositories to run its analysis.',
      action: (
        <button className="primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Search Another User</span>
        </button>
      )
    },
    'rate-limit': {
      icon: <AlertTriangle size={48} className="text-warning" />,
      title: 'GitHub API Rate Limit Reached',
      description: customMessage || 'We hit the GitHub rate limit. Configure a GITHUB_TOKEN in your backend .env file to lift limits to 5000 requests/hour, or wait a few minutes.',
      action: onRetry ? (
        <button className="primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Try Again Now</span>
        </button>
      ) : (
        <button className="primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Safety</span>
        </button>
      )
    },
    'failed': {
      icon: <XCircle size={48} className="text-danger" />,
      title: 'AI Analysis Failed',
      description: customMessage || 'Something went wrong while parsing the repositories or fetching insights. Our server returned an error.',
      action: onRetry ? (
        <button className="primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Analysis</span>
        </button>
      ) : (
        <button className="primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Back to Homepage</span>
        </button>
      )
    },
    'empty': {
      icon: <FileText size={48} className="text-muted" />,
      title: 'No Profile Loaded',
      description: customMessage || 'Welcome to the Developer Intelligence Dashboard! Enter a username to analyze or inspect a candidate report.',
      action: (
        <button className="primary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>Analyze Candidate</span>
        </button>
      )
    }
  };

  const state = configs[type];

  return (
    <div className="panel error-state-panel animate-slide-up" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 600, margin: '40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div className="error-icon-wrapper" style={{ padding: 16, borderRadius: '50%', background: 'var(--surface-3)', border: 'var(--glass-border)' }}>
        {state.icon}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{state.title}</h2>
      <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, margin: 0, color: 'var(--muted)' }}>{state.description}</p>
      <div style={{ marginTop: 8 }}>
        {state.action}
      </div>
    </div>
  );
};

export default ErrorStates;
