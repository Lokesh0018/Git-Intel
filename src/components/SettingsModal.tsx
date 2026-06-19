import { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';
import { storage } from '../services/storage';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [token, setToken] = useState('');

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
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card fade-in-up" style={{ width: '100%', maxWidth: '500px', margin: '1rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={24} />
        </button>
        
        <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>
          <Key size={24} color="var(--accent-color)" />
          Application Settings
        </h2>
        <p className="text-secondary mb-8">Configure your GitHub Personal Access Token to avoid rate limits during analysis.</p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">GitHub Personal Access Token</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="ghp_xxxxxxxxxxxx" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-sm text-secondary mt-2">
              Required for fetching more than 60 profiles per hour. The token is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          
          <div className="flex gap-4 mt-8">
            <button type="submit" className="btn" style={{ flex: 1 }}>Save Settings</button>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
