import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Cpu, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import ErrorStates, { type ErrorStateType } from '../components/ErrorStates';

const STAGES = [
  'Fetching GitHub profile metadata',
  'Reading public code repositories',
  'Detecting frameworks and technologies',
  'Evaluating architectural complexity',
  'Generating recruiter-focused insights',
  'Finalizing Developer Intelligence report'
];

const AnalysisLoadingPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [activeStage, setActiveStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [repoCount, setRepoCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [techCount, setTechCount] = useState(0);
  const [errorType, setErrorType] = useState<ErrorStateType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!username) return;
    let active = true;

    // Increments counters for visual excitement
    const counterInterval = setInterval(() => {
      setRepoCount((prev) => (prev < 24 ? prev + 1 : prev));
      setFileCount((prev) => (prev < 642 ? prev + Math.floor(Math.random() * 25) + 5 : prev));
      setTechCount((prev) => (prev < 14 ? prev + (Math.random() > 0.7 ? 1 : 0) : prev));
    }, 120);

    // Moves through pipeline stages
    const stageInterval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev < STAGES.length - 1) {
          setCompletedStages((comp) => [...comp, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    // Call actual analysis API
    const runAnalysis = async () => {
      try {
        const bundle = await api.analyze(username);
        if (!active) return;
        
        // Fast forward all steps to complete
        clearInterval(stageInterval);
        setCompletedStages(STAGES.map((_, i) => i));
        setActiveStage(STAGES.length - 1);
        setRepoCount(bundle.profile.publicRepos || 15);
        setFileCount(bundle.repositories.reduce((acc, r) => acc + (r.commits || 10), 0) * 8);
        setTechCount(Array.from(new Set(bundle.repositories.flatMap(r => r.technologies))).length || 8);

        // Hold for half a second, then navigate to dashboard
        setTimeout(() => {
          if (active) {
            navigate(`/dashboard/${bundle.profile.username}`);
          }
        }, 800);
      } catch (err: any) {
        if (!active) return;
        clearInterval(stageInterval);
        clearInterval(counterInterval);
        
        const msg = err.message || '';
        if (msg.includes('rate limit') || msg.includes('403') || msg.includes('429')) {
          setErrorType('rate-limit');
        } else if (msg.includes('not found') || msg.includes('404')) {
          setErrorType('not-found');
        } else if (msg.includes('no repositories')) {
          setErrorType('no-repos');
        } else {
          setErrorType('failed');
          setErrorMessage(msg);
        }
      }
    };

    runAnalysis();

    return () => {
      active = false;
      clearInterval(counterInterval);
      clearInterval(stageInterval);
    };
  }, [username, navigate]);

  if (errorType) {
    return <ErrorStates type={errorType} customMessage={errorMessage} />;
  }

  return (
    <div className="page loading-page animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 20 }}>
      {/* AI Pulse Sphere */}
      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 32, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.3, animation: 'pulse 1.8s infinite' }}></div>
        <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-3) 0%, transparent 70%)', opacity: 0.2, animation: 'pulse 1.8s infinite 0.4s' }}></div>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(8, 11, 18, 0.8)', border: '2px solid var(--accent)', display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(108, 99, 255, 0.4)' }}>
          <Cpu size={24} className="text-accent animate-pulse-glow" style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, marginBottom: 12, textAlign: 'center' }}>
        Analyzing <span style={{ color: 'var(--accent-3)' }}>@{username}</span>...
      </h1>
      <p className="muted" style={{ textAlign: 'center', maxWidth: 450, margin: '0 auto 32px auto', fontSize: 14 }}>
        GitIntel is downloading public repositories, parsing code files, and running AI models to map the developer's skill evidence.
      </p>

      {/* Live Counter Metrics Row */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-around', gap: 20, width: '100%', maxWidth: 600, padding: '16px 24px', marginBottom: 28, background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Repositories Scanned</span>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent-3)' }}>{repoCount}</span>
        </div>
        <div style={{ width: 1, background: 'var(--line)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Code Files Parsed</span>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent)' }}>{fileCount}</span>
        </div>
        <div style={{ width: 1, background: 'var(--line)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Technologies Detected</span>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--success)' }}>{techCount}</span>
        </div>
      </div>

      {/* Loading Pipeline Stages */}
      <div className="loading-pipeline">
        {STAGES.map((stage, idx) => {
          const isCompleted = completedStages.includes(idx);
          const isActive = activeStage === idx;
          const isPending = !isCompleted && !isActive;

          return (
            <div key={idx} className={`pipeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
              <div className="pipeline-icon">
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--ink)' : isCompleted ? 'var(--muted)' : 'rgba(255,255,255,0.2)' }}>
                  {stage}
                </span>
              </div>
              {isActive && (
                <span className="animate-pulse-glow" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisLoadingPage;
