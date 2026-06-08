import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RepositoryCard from '../components/RepositoryCard';
import { api, type ProfileBundle } from '../services/api';
import { ShieldAlert, Github, Star } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [bundle, setBundle] = useState<ProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      setLoading(true);
      setError('');
      try {
        const result = await api.profile(username);
        setBundle(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="profile-standalone-loading">
        <p className="muted">Retrieving candidate profile portfolio...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="profile-standalone-error">
        <ShieldAlert size={48} color="#a73523" />
        <h2>Profile Not Found</h2>
        <p className="error">{error || 'This developer profile has not been analyzed yet.'}</p>
      </div>
    );
  }

  return (
    <div className="profile-standalone-page">
      <header className="profile-standalone-header">
        <div className="brand-standalone">
          <Github size={20} />
          <strong>GitIntel Portfolio</strong>
        </div>
      </header>
      
      <div className="profile-standalone-container">
        <section className="profile-hero compact">
          <img src={bundle.profile.avatarUrl} alt={bundle.profile.username} />
          <div>
            <p className="eyebrow">Evidence-based Portfolio</p>
            <h1>{bundle.profile.name || bundle.profile.username}</h1>
            <p className="lede">{bundle.profile.bio || bundle.insights.summary}</p>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 24 }}>
          <h2>Repository Portfolio</h2>
          <p className="muted" style={{ marginBottom: 20 }}>
            Curated list of public repositories sorted by engineering complexity and stars.
          </p>
          <div className="repo-grid">
            {bundle.repositories.map((repo) => (
              <RepositoryCard key={repo.fullName} repository={repo} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
