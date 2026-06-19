import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Trash2, Eye, Briefcase, Users, Download } from 'lucide-react';
import { storage } from '../services/storage';
import { ProfileBundle } from '../services/api';

const FILTERS = [
  'Frontend', 'Backend', 'Full Stack', 'React', 'Node.js', 'Python', 'Java', 'Senior', 'Mid-Level', 'Junior'
];

export default function TalentPoolPage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<ProfileBundle[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    storage.getCandidates().then(setCandidates);
  }, []);

  const handleDelete = async (username: string) => {
    await storage.deleteCandidate(username);
    storage.getCandidates().then(setCandidates);
  };

  const handleExportCSV = () => {
    const headers = ['Username', 'Name', 'Overall Score', 'Experience', 'Quality', 'Consistency', 'Top Skills'];
    const rows = filteredCandidates.map(c => [
      c.profile.username,
      c.profile.name || '',
      c.scores.overall.score,
      c.scores.experience.score,
      c.scores.quality.score,
      c.scores.consistency.score,
      c.insights.strengths.slice(0, 3).join(' / ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gitintel_talent_pool.csv';
    link.click();
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    if (search) {
      filtered = filtered.filter(c => 
        c.profile.username.toLowerCase().includes(search.toLowerCase()) || 
        c.profile.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeFilters.length > 0) {
      filtered = filtered.filter(c => {
        const textToSearch = [
          c.scores.experience.score > 60 ? 'Senior' : c.scores.experience.score > 40 ? 'Mid-Level' : 'Junior',
          ...c.insights.strengths,
          c.insights.recommendedRoles[0]?.role || ''
        ].join(' ').toLowerCase();

        return activeFilters.every(f => textToSearch.includes(f.toLowerCase()));
      });
    }

    return filtered;
  }, [candidates, search, activeFilters]);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Talent Pool</h1>
          <p className="text-secondary">Manage and compare your saved candidates.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
          <div className="badge badge-accent" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
            {candidates.length} Candidates
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex gap-4 mb-4">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} className="text-secondary" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name or username..." 
              style={{ paddingLeft: '3rem' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button 
              key={f}
              onClick={() => toggleFilter(f)}
              className={`badge ${activeFilters.includes(f) ? 'badge-accent' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', border: 'none', padding: '0.4rem 0.8rem' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {filteredCandidates.map(c => (
          <div key={c.profile.username} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {c.profile.avatarUrl ? (
                  <img src={c.profile.avatarUrl} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color="var(--text-secondary)" />
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{c.profile.name || c.profile.username}</h3>
                  <p className="text-secondary text-sm">@{c.profile.username}</p>
                </div>
              </div>
              <div className="score-value" style={{ fontSize: '1.5rem', margin: 0 }}>{c.scores.overall.score}</div>
            </div>

            <div className="mb-4 flex-grow">
              <div className="text-sm mb-2"><strong>Level:</strong> {c.scores.experience.score > 60 ? 'Senior' : c.scores.experience.score > 40 ? 'Mid-Level' : 'Junior'}</div>
              <div className="text-sm mb-2"><strong>Top Skills:</strong> {c.insights.strengths.slice(0, 3).join(', ')}</div>
              <div className="mt-4">
                <span className={`badge ${c.scores.overall.score > 70 ? 'badge-success' : (c.scores.overall.score < 50 ? 'badge-danger' : 'badge-warning')}`}>
                  {c.scores.overall.score > 85 ? 'Highly Recommended' : (c.scores.overall.score > 70 ? 'Recommended' : (c.scores.overall.score < 50 ? 'Not Recommended' : 'Consider'))}
                </span>
              </div>
            </div>

            <div className="flex gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => navigate(`/report/${c.profile.username}`)}>
                <Eye size={16} /> View
              </button>
              <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => navigate(`/job-match?candidate=${c.profile.username}`)}>
                <Briefcase size={16} /> Role
              </button>
              <button className="btn btn-outline btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(c.profile.username)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '4rem 2rem' }}>
            <Users size={48} className="text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No candidates found</h3>
            <p className="text-secondary mb-4">You haven't saved any candidates matching this criteria.</p>
            <button className="btn" onClick={() => navigate('/')}>Analyze a Candidate</button>
          </div>
        )}
      </div>
    </div>
  );
}
