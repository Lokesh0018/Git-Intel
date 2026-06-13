import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X, Check, Star, Briefcase, GitCommit, Shield } from 'lucide-react';
import { storage } from '../services/storage';
import { ProfileBundle } from '../services/api';

export default function ComparisonPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<ProfileBundle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setCandidates(storage.getCandidates());
  }, []);

  const toggleCandidate = (username: string) => {
    setSelectedIds(prev => 
      prev.includes(username) 
        ? prev.filter(id => id !== username)
        : (prev.length < 3 ? [...prev, username] : prev) // Limit to 3 for UI sake
    );
  };

  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.profile.username));

  if (candidates.length < 2) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Users size={48} className="text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Not enough candidates</h2>
          <p className="text-secondary mb-6">You need at least two candidates in your Talent Pool to compare them. Save candidates from their report pages.</p>
          <button className="btn" onClick={() => navigate('/')}>Find Candidates</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Compare Candidates</h1>
          <p className="text-secondary">Select up to 3 candidates from your Talent Pool to compare their metrics side-by-side.</p>
        </div>
      </div>

      {/* Selection Area */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">Select Candidates ({selectedIds.length}/3)</h3>
        <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          {candidates.map(c => {
            const isSelected = selectedIds.includes(c.profile.username);
            return (
              <div 
                key={c.profile.username}
                onClick={() => toggleCandidate(c.profile.username)}
                style={{ 
                  minWidth: '200px', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  backgroundColor: isSelected ? '#F0F9FF' : 'white',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {isSelected && <Check size={16} color="white" style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--accent-color)', borderRadius: '50%', padding: '2px' }} />}
                <div className="flex items-center gap-3">
                  <img src={c.profile.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div className="font-bold text-sm truncate">{c.profile.name || c.profile.username}</div>
                    <div className="text-xs text-secondary truncate">@{c.profile.username}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {selectedCandidates.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: '800px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '200px', backgroundColor: '#F8FAFC' }}>Metrics</th>
                {selectedCandidates.map(c => (
                  <th key={c.profile.username} className="text-center" style={{ width: `${80 / selectedCandidates.length}%` }}>
                    <div className="flex flex-col items-center gap-2">
                      <img src={c.profile.avatarUrl} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                      <div>
                        <div className="font-bold">{c.profile.name || c.profile.username}</div>
                        <button className="text-xs text-accent" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => toggleCandidate(c.profile.username)}>Remove</button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Overall Score */}
              <tr>
                <td className="font-bold bg-light"><div className="flex items-center gap-2"><Star size={16} className="text-accent" /> Overall Score</div></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.scores.overall.score >= 85 ? 'var(--success-color)' : (c.scores.overall.score >= 70 ? 'var(--accent-color)' : 'var(--warning-color)') }}>
                      {c.scores.overall.score}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Experience Level */}
              <tr>
                <td className="font-bold bg-light"><div className="flex items-center gap-2"><Briefcase size={16} className="text-accent" /> Experience</div></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center font-bold">
                    {c.scores.experience.score > 60 ? 'Senior' : c.scores.experience.score > 40 ? 'Mid-Level' : 'Junior'}
                  </td>
                ))}
              </tr>

              {/* Verified Skills */}
              <tr>
                <td className="font-bold bg-light"><div className="flex items-center gap-2"><Check size={16} className="text-success" /> Top Skills</div></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username}>
                    <div className="flex flex-col gap-1 align-center">
                      {c.insights.strengths.slice(0, 4).map((s, i) => (
                        <span key={i} className="badge badge-neutral text-xs text-center">{s}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Sub-scores */}
              <tr>
                <td className="font-bold bg-light"><div className="flex items-center gap-2"><GitCommit size={16} className="text-secondary" /> Consistency</div></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">
                    {c.scores.consistency.score}/100
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-bold bg-light"><div className="flex items-center gap-2"><Shield size={16} className="text-secondary" /> Project Quality</div></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">
                    {c.scores.quality.score}/100
                  </td>
                ))}
              </tr>

              {/* Repos & Followers */}
              <tr>
                <td className="font-bold bg-light">Public Repos</td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">{c.profile.publicRepos}</td>
                ))}
              </tr>
              <tr>
                <td className="font-bold bg-light">Followers</td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">{c.profile.followers}</td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="bg-light"></td>
                {selectedCandidates.map(c => (
                  <td key={c.profile.username} className="text-center">
                    <button className="btn" style={{ width: '100%' }} onClick={() => navigate(`/report/${c.profile.username}`)}>
                      Full Report
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
