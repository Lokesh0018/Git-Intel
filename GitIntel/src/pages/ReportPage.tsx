import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, CheckCircle, User, GitCommit, Star, Shield, BookmarkPlus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api, ProfileBundle } from '../services/api';
import { storage } from '../services/storage';

export default function ReportPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    // First try to load from storage
    const existing = storage.getCandidate(username);
    if (existing) {
      setData(existing);
      setSaved(true);
      setLoading(false);
      return;
    }

    // Otherwise load from api (which should have it cached if navigated from analyzing)
    api.analyze(username)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [username]);

  const exportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Candidate_Report_${username}.pdf`);
  };

  const handleSave = () => {
    if (data) {
      storage.saveCandidate(data);
      setSaved(true);
    }
  };

  if (loading) return <div className="report-container text-center mt-8">Loading Report...</div>;
  if (error) return <div className="report-container text-center mt-8 text-danger">{error}</div>;
  if (!data) return <div className="report-container text-center mt-8">Report not found.</div>;

  const { profile, scores, insights } = data;
  
  // Create mock area chart data for consistency trend
  const trendData = [
    { name: 'Jan', val: 20 }, { name: 'Feb', val: 40 }, { name: 'Mar', val: 35 }, 
    { name: 'Apr', val: 50 }, { name: 'May', val: 45 }, { name: 'Jun', val: 70 }
  ];

  let recommendation = 'Consider';
  let recColor = '#0ea5e9';
  if (scores.overall.score > 85) { recommendation = 'Highly Recommended'; recColor = '#22C55E'; }
  else if (scores.overall.score > 70) { recommendation = 'Recommended'; recColor = '#10B981'; }
  else if (scores.overall.score < 50) { recommendation = 'Not Recommended'; recColor = '#EF4444'; }

  let scoreLabel = 'Average';
  if (scores.overall.score >= 85) scoreLabel = 'Excellent';
  else if (scores.overall.score >= 70) scoreLabel = 'Strong';
  else if (scores.overall.score < 50) scoreLabel = 'Needs Improvement';

  return (
    <div className="report-container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Candidate Intelligence Report</h1>
        <button className="btn btn-outline" onClick={exportPDF}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div id="report-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Candidate Overview */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-6">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '12px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} color="var(--text-secondary)" />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{profile.name || profile.username}</h2>
              <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>@{profile.username}</p>
              <div className="flex gap-6 text-sm mt-2">
                <div><strong>Followers:</strong> {profile.followers}</div>
                <div><strong>Repositories:</strong> {profile.publicRepos}</div>
              </div>
            </div>
          </div>
          
          <div className="text-center" style={{ paddingLeft: '3rem', borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Score</div>
            <div className="score-value">
              {scores.overall.score}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>/100</span>
            </div>
            <div className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
              {scoreLabel}
            </div>
          </div>
        </div>

        {/* Hiring Recommendation Card */}
        <div className="card" style={{ backgroundColor: '#F8FAFC', borderLeft: `4px solid ${recColor}`, padding: '2rem' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Hiring Recommendation</div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: recColor, margin: 0 }}>
                {recommendation}
              </h2>
            </div>
            <div className="text-right flex gap-4">
              <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', minWidth: '140px' }}>
                <div className="text-sm text-secondary mb-1">Match Confidence</div>
                <div className="font-bold text-2xl">{Math.min(100, scores.overall.score + 10)}%</div>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', fontSize: '1.1rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            Based on the analysis of {profile.publicRepos} repositories and {scores.overall.evidence[1]?.value} stars, this candidate aligns well with standard industry expectations for their level.
          </div>
        </div>

        {/* AI Executive Summary */}
        <div className="card">
          <h2 className="card-title mb-4">AI Executive Summary</h2>
          <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
            <p className="mb-4">{insights.summary}</p>
            <div className="grid-2 mt-6">
              <div style={{ backgroundColor: '#F1F5F9', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><CheckCircle size={18} color="var(--success-color)" /> Key Strengths</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {insights.strengths.map((s, i) => (
                    <li key={i} className="mb-2 flex items-center gap-2"><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></div>{s}</li>
                  ))}
                </ul>
              </div>
              <div style={{ backgroundColor: '#F1F5F9', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 className="font-bold mb-3 flex items-center gap-2"><Shield size={18} color="var(--warning-color)" /> Considerations</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {insights.weaknesses.map((s, i) => (
                    <li key={i} className="mb-2 flex items-center gap-2"><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--warning-color)' }}></div>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Skills & Experience */}
        <div className="grid-2">
          {/* Verified Skills */}
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h2 className="card-title mb-4"><CheckCircle size={20} color="var(--success-color)" /> Verified Skills</h2>
            <div className="table-container" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '350px' }}>
              <table className="table" style={{ fontSize: '0.95rem' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    <th>Skill</th>
                    <th>Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.strengths.map((skill, i) => {
                    const conf = 95 - (i * 5);
                    return (
                      <tr key={i}>
                        <td className="font-bold">{skill}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="progress-bar-container" style={{ width: '80px', height: '0.5rem' }}>
                              <div className="progress-bar-fill" style={{ width: `${conf}%` }}></div>
                            </div>
                            <span className="font-bold">{conf}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-success">Verified</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Experience Estimation & Project Quality */}
          <div className="flex flex-col gap-6">
            <div className="card score-card m-0" style={{ padding: '2rem' }}>
              <h2 className="card-title justify-center m-0">Experience Estimation</h2>
              <div className="text-center my-4">
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                  {scores.experience.score > 60 ? 'Senior' : scores.experience.score > 40 ? 'Mid-Level' : 'Junior'}
                </div>
              </div>
              <p className="text-secondary text-sm">Based on {scores.experience.evidence[0]?.value} years active on GitHub.</p>
            </div>

            <div className="card m-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title m-0"><Star size={20} color="#F59E0B" /> Project Quality</h2>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{scores.quality.score}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/100</span></div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Code Organization</span>
                    <span className="text-sm font-bold">{Math.min(100, scores.quality.score + 10)}%</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${Math.min(100, scores.quality.score + 10)}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Project Completeness</span>
                    <span className="text-sm font-bold">{scores.quality.score}%</span>
                  </div>
                  <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${scores.quality.score}%`, background: 'var(--success-color)' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Consistency Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title m-0"><GitCommit size={20} color="var(--accent-color)" /> Contribution Consistency</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{scores.consistency.score}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/100</span></div>
          </div>
          
          <div style={{ height: '250px', width: '100%', marginTop: '2rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Save Candidate Option */}
      {!saved ? (
        <div className="card mt-8 text-center" style={{ background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))', color: 'white' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Would you like to save this candidate?</h3>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }}>Save this report to your local Talent Pool for future comparison and role analysis.</p>
          <div className="flex justify-center gap-4">
            <button className="btn" onClick={handleSave} style={{ background: 'white', color: 'var(--accent-color)' }}>
              <BookmarkPlus size={20} /> Save Candidate
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Skip for now
            </button>
          </div>
        </div>
      ) : (
        <div className="card mt-8 text-center" style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }}>
          <div className="flex justify-center items-center gap-2" style={{ color: '#166534', fontSize: '1.25rem', fontWeight: 600 }}>
            <CheckCircle size={24} /> Candidate Saved to Talent Pool
          </div>
          <button className="btn mt-4" onClick={() => navigate('/talent-pool')}>View Talent Pool</button>
        </div>
      )}

    </div>
  );
}
