import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Eye, FileText, CheckCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { email } = useAuth();

  return (
    <div className="page">
      <section className="panel settings-panel">
        <p className="eyebrow">Settings</p>
        <h1>Workspace Configuration</h1>
        
        <div className="settings-list">
          <div>
            <div className="settings-header">
              <Shield size={18} />
              <strong>Signed in user</strong>
            </div>
            <span>{email || 'Not signed in (Guest Session)'}</span>
          </div>
          
          <div>
            <div className="settings-header">
              <Key size={18} />
              <strong>GitHub API Integration</strong>
            </div>
            <span>
              Configure <code>GITHUB_TOKEN</code> in your backend <code>.env</code> file for higher rate limits (5000 requests/hour instead of 60).
            </span>
          </div>
          
          <div>
            <div className="settings-header">
              <Eye size={18} />
              <strong>AI Analysis Pipeline</strong>
            </div>
            <span>
              Configure <code>OPENAI_API_KEY</code> on the backend to trigger GPT-powered repository complexity and architecture audits. Local rule-based calculations remain active as a fallback.
            </span>
          </div>
          
          <div>
            <div className="settings-header">
              <FileText size={18} />
              <strong>Data Portability & Sharing</strong>
            </div>
            <span>
              The raw JSON developer report endpoint is publicly available at <code>/api/report/:username</code>. Public dashboard share links contain unique cryptographic hashes to preserve recruiter workspace privacy.
            </span>
          </div>
        </div>
        
        <div className="settings-footer" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} color="var(--accent)" />
          <small className="muted">GitIntel Engine v1.0.0 (API connected)</small>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
