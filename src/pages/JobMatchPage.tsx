import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Search, Target } from 'lucide-react';
import { storage } from '../services/storage';
import { ProfileBundle } from '../services/api';

export default function JobMatchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialUsername = searchParams.get('candidate') || '';

  const [candidates, setCandidates] = useState<ProfileBundle[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>(initialUsername);
  const [jobDescription, setJobDescription] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  useEffect(() => {
    storage.getCandidates().then(saved => {
      setCandidates(saved);
      if (!initialUsername && saved.length > 0) {
        setSelectedCandidate(saved[0].profile.username);
      }
    });
  }, [initialUsername]);

  const handleAnalyze = () => {
    if (!selectedCandidate || !jobDescription.trim()) return;

    setAnalyzing(true);
    setMatchResult(null);

    // Mock an AI evaluation process
    setTimeout(() => {
      const candidate = candidates.find(c => c.profile.username === selectedCandidate);
      if (!candidate) return;

      const descLower = jobDescription.toLowerCase();
      let matchScore = candidate.scores.overall.score; // Base it off overall score
      let matchReason = "Candidate has a strong foundational skill set.";

      const jobKeywords = ['react', 'node', 'python', 'java', 'aws', 'docker', 'typescript', 'frontend', 'backend'];
      const matchedKeywords = jobKeywords.filter(k => descLower.includes(k) && candidate.insights.strengths.some(s => s.toLowerCase().includes(k)));
      const missingKeywords = jobKeywords.filter(k => descLower.includes(k) && !candidate.insights.strengths.some(s => s.toLowerCase().includes(k)));

      if (matchedKeywords.length > 0) {
        matchScore = Math.min(100, matchScore + (matchedKeywords.length * 5));
        matchReason = `Candidate possesses key skills required for this role: ${matchedKeywords.join(', ')}.`;
      }
      if (missingKeywords.length > 0) {
        matchScore = Math.max(0, matchScore - (missingKeywords.length * 5));
      }

      setMatchResult({
        score: Math.floor(matchScore),
        reasoning: matchReason,
        matched: matchedKeywords,
        missing: missingKeywords,
        candidate: candidate.profile.name || candidate.profile.username
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Role Match Analysis</h1>
          <p className="text-secondary">Evaluate a candidate's fit against a specific job description.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2"><UserIcon /> Select Candidate</h3>
            {candidates.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-secondary mb-4">No candidates in your Talent Pool.</p>
                <button className="btn btn-outline" onClick={() => navigate('/')}>Find Candidates</button>
              </div>
            ) : (
              <select 
                className="form-input" 
                value={selectedCandidate} 
                onChange={e => setSelectedCandidate(e.target.value)}
              >
                {candidates.map(c => (
                  <option key={c.profile.username} value={c.profile.username}>
                    {c.profile.name || c.profile.username} (@{c.profile.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={20} /> Job Description</h3>
            <textarea 
              className="form-input" 
              style={{ flexGrow: 1, minHeight: '200px', resize: 'none' }}
              placeholder="Paste the job description or requirements here..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
            <button 
              className="btn mt-4 w-full" 
              onClick={handleAnalyze} 
              disabled={!selectedCandidate || !jobDescription.trim() || analyzing}
            >
              {analyzing ? (
                <><Search className="animate-spin" size={18} /> Analyzing Fit...</>
              ) : (
                <><Target size={18} /> Evaluate Match</>
              )}
            </button>
          </div>
        </div>

        <div>
          {analyzing ? (
            <div className="card h-full flex flex-col items-center justify-center text-center py-12">
              <div className="animate-pulse flex flex-col items-center">
                <Target size={48} className="text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">AI is evaluating the match...</h3>
                <p className="text-secondary">Comparing candidate repository data against job requirements.</p>
              </div>
            </div>
          ) : matchResult ? (
            <div className="card h-full fade-in-up">
              <div className="text-center mb-8 border-b pb-8">
                <h2 className="text-xl font-bold mb-4">Match Result for {matchResult.candidate}</h2>
                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto' }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={matchResult.score >= 80 ? 'var(--success-color)' : (matchResult.score >= 60 ? 'var(--accent-color)' : 'var(--warning-color)')}
                      strokeWidth="3"
                      strokeDasharray={`${matchResult.score}, 100`}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{matchResult.score}%</div>
                    <div className="text-xs text-secondary font-bold uppercase mt-1">Match</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold mb-2 text-lg">AI Recommendation</h4>
                <p style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', lineHeight: 1.6 }}>
                  {matchResult.reasoning}
                </p>
              </div>

              <div className="grid-2 gap-4">
                <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <h5 className="font-bold text-success mb-2 flex items-center gap-2"><CheckCircle size={16} /> Matched Requirements</h5>
                  {matchResult.matched.length > 0 ? (
                    <ul className="pl-5 mb-0 text-sm">
                      {matchResult.matched.map((m: string) => <li key={m} className="capitalize">{m}</li>)}
                    </ul>
                  ) : <span className="text-sm text-secondary">None found in top skills.</span>}
                </div>
                
                <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '8px', border: '1px solid #FECACA' }}>
                  <h5 className="font-bold text-danger mb-2 flex items-center gap-2"><FileText size={16} /> Missing Requirements</h5>
                  {matchResult.missing.length > 0 ? (
                    <ul className="pl-5 mb-0 text-sm">
                      {matchResult.missing.map((m: string) => <li key={m} className="capitalize">{m}</li>)}
                    </ul>
                  ) : <span className="text-sm text-secondary">None identified.</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-center py-12" style={{ backgroundColor: '#F8FAFC' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <Target size={40} className="text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready for Analysis</h3>
              <p className="text-secondary max-w-md mx-auto">Select a candidate and paste a job description on the left to evaluate their fit for the role.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure User is imported
import { User as UserIcon } from 'lucide-react';
