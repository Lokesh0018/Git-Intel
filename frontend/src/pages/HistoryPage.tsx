import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const filteredHistory = history.filter(h => 
    h.username.toLowerCase().includes(search.toLowerCase()) || 
    (h.name && h.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1>Candidate Reports History</h1>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search candidates..." 
            style={{ paddingLeft: '35px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center p-4">Loading history...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Username</th>
                  <th>Analysis Date</th>
                  <th>Overall Score</th>
                  <th>Recommendation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        {h.avatarUrl && <img src={h.avatarUrl} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />}
                        <strong>{h.name || h.username}</strong>
                      </div>
                    </td>
                    <td className="text-secondary">@{h.username}</td>
                    <td>{new Date(h.analyzedAt).toLocaleDateString()}</td>
                    <td>
                      <strong>{h.overallScore}</strong> <span className="text-sm text-secondary">({h.scoreCategory})</span>
                    </td>
                    <td>
                      <span className={'badge ' + (h.hiringReadiness?.includes('Ready') ? 'badge-success' : h.hiringReadiness?.includes('Review') ? 'badge-warning' : 'badge-danger')}>
                        {h.hiringReadiness}
                      </span>
                    </td>
                    <td>
                      <Link to={'/report/' + h.username} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                        View Report <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-secondary">No candidates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
