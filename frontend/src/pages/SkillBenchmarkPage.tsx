import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Code, Star, Users } from 'lucide-react';
import { storage } from '../services/storage';
import { ProfileBundle } from '../services/api';

const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'TSX', 'JSX', 'HTML', 'CSS', 
  'Node.js', 'Express', 'Python', 'Java', 'Go', 'Rust', 'Vue', 'Angular', 
  'Next.js', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 
  'Docker', 'AWS', 'Jest'
];

export default function SkillBenchmarkPage() {
  const [candidates, setCandidates] = useState<ProfileBundle[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('React');

  useEffect(() => {
    setCandidates(storage.getCandidates());
  }, []);

  const benchmarkData = [
    { name: 'Junior', score: 45 },
    { name: 'Mid-Level', score: 65 },
    { name: 'Senior', score: 85 },
    { name: 'Lead', score: 95 }
  ];

  const poolCandidatesWithSkill = candidates.filter(c => 
    c.insights.strengths.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase())) ||
    c.repositories.some(r => r.technologies.some(t => t.toLowerCase().includes(selectedSkill.toLowerCase())))
  );

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Skill Benchmark</h1>
          <p className="text-secondary">Compare your talent pool against global skill benchmarks.</p>
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="font-bold mb-4">Select Technology</h3>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {SKILLS.map(skill => (
            <button 
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`badge ${selectedSkill === skill ? 'badge-accent' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem' }}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="card-title mb-6"><Activity size={20} /> {selectedSkill} Global Benchmarks</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="score" fill="var(--accent-color)" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-secondary mt-4 text-center">
            Standard expected capability scores for {selectedSkill} across seniority levels.
          </p>
        </div>

        <div className="card">
          <h3 className="card-title mb-6"><Users size={20} /> Your Talent Pool ({selectedSkill})</h3>
          
          {poolCandidatesWithSkill.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: '200px' }}>
              <Code size={48} className="text-secondary mb-4 opacity-50" />
              <p className="text-secondary">No candidates in your Talent Pool have {selectedSkill} identified as a top skill.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4" style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '1rem' }}>
              {poolCandidatesWithSkill.map(c => {
                let conf = 0;
                const strengthIndex = c.insights.strengths.findIndex(s => s.toLowerCase().includes(selectedSkill.toLowerCase()));
                if (strengthIndex >= 0) {
                  conf = 95 - (strengthIndex * 5);
                } else {
                  const repoCount = c.repositories.filter(r => r.technologies.some(t => t.toLowerCase().includes(selectedSkill.toLowerCase()))).length;
                  conf = Math.min(75, 40 + (repoCount * 5));
                }
                
                return (
                  <div key={c.profile.username} className="flex items-center gap-4 p-3" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <img src={c.profile.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="font-bold text-sm">{c.profile.name || c.profile.username}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="progress-bar-container" style={{ flex: 1, height: '4px' }}>
                          <div className="progress-bar-fill" style={{ width: `${conf}%`, backgroundColor: conf >= 85 ? 'var(--success-color)' : 'var(--accent-color)' }}></div>
                        </div>
                        <span className="text-xs font-bold w-8 text-right">{conf}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
