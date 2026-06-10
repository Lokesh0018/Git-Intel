import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Cpu, Layers, Award, Terminal, ArrowRight, Star, GitFork, Check } from 'lucide-react';
import ActivityHeatmap from '../components/ActivityHeatmap';

// Simulated Typing Effect texts
const TYPING_PHRASES = ['Developer Intelligence.', 'Evidence-Based Screening.', 'Codebase Complexity Mapping.', 'Recruiter Insights.'];

const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [subPhrase, setSubPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Typewriter effect logic
  useEffect(() => {
    let timer: number;
    const activeText = TYPING_PHRASES[phraseIdx];
    
    if (isDeleting) {
      timer = window.setTimeout(() => {
        setSubPhrase((prev) => prev.slice(0, -1));
      }, 50);
    } else {
      timer = window.setTimeout(() => {
        setSubPhrase((prev) => activeText.slice(0, prev.length + 1));
      }, 100);
    }

    if (!isDeleting && subPhrase === activeText) {
      timer = window.setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && subPhrase === '') {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPING_PHRASES.length);
    }

    return () => clearTimeout(timer);
  }, [subPhrase, isDeleting, phraseIdx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername) return;
    navigate(`/analyze/${cleanUsername}`);
  };

  return (
    <div className="page landing-page animate-fade-in" style={{ gap: 64, padding: '24px 0' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, alignItems: 'center', minHeight: '60vh', position: 'relative' }}>
        
        {/* Floating blurred background highlights */}
        <div style={{ position: 'absolute', top: -40, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239, 28, 37, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>

        <div>
          <p className="eyebrow" style={{ letterSpacing: 3 }}>AI-Powered Screening Platform</p>
          <h1 style={{ fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 16 }}>
            Turn GitHub Activity <br />
            Into <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{subPhrase || '\u00A0'}</span>
          </h1>
          <p className="lede" style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32, maxWidth: 520 }}>
            GitIntel parses candidate source codes, evaluates codebase complexity, audits DevOps configurations, and maps verified skills.
          </p>

          <form className="search-row animate-pulse-glow" onSubmit={handleSubmit} style={{ maxWidth: 500, padding: 4, background: 'var(--surface-3)', border: 'var(--glass-border)', borderRadius: 14 }}>
            <input
              required
              placeholder="Enter GitHub username (e.g. facebook)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ background: 'transparent', border: 'none', paddingLeft: 16 }}
            />
            <button className="primary" type="submit" style={{ minHeight: 44 }}>
              <Play size={14} fill="currentColor" />
              <span>Analyze</span>
            </button>
          </form>
        </div>

        {/* Hero visual: Floating code/repo cards in background */}
        <div className="no-print" style={{ display: 'grid', gap: 16, position: 'relative' }}>
          <div className="panel tilt-card" style={{ transform: 'rotate(-4deg)', padding: 18, background: 'var(--surface)', borderColor: 'rgba(239, 28, 37, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>react-intelligence-dashboard</strong>
              <span className="tech-chip" style={{ fontSize: 9 }}>Complexity: 92</span>
            </div>
            <p className="muted" style={{ fontSize: 11, margin: 0 }}>High evidence of custom hooks, complex state routers, and concurrent rendering hooks.</p>
          </div>
          
          <div className="panel tilt-card" style={{ transform: 'rotate(2deg) translateX(20px)', padding: 18, background: 'var(--surface)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>fastapi-ml-microservice</strong>
              <span className="tech-chip" style={{ fontSize: 9 }}>Complexity: 84</span>
            </div>
            <p className="muted" style={{ fontSize: 11, margin: 0 }}>Contains automated tests, Pytest coverage configurations, and Docker builds.</p>
          </div>
        </div>
      </section>

      {/* 2. TRUST METRICS SECTION */}
      <section className="panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center', padding: '24px 16px', background: 'var(--surface)' }}>
        <div>
          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent)' }}>10k+</span>
          <p className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, margin: '4px 0 0 0' }}>Profiles Analyzed</p>
        </div>
        <div style={{ borderLeft: 'var(--glass-border)', paddingLeft: 16 }}>
          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-3)' }}>250k+</span>
          <p className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, margin: '4px 0 0 0' }}>Repositories Scanned</p>
        </div>
        <div style={{ borderLeft: 'var(--glass-border)', paddingLeft: 16 }}>
          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--success)' }}>12k+</span>
          <p className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, margin: '4px 0 0 0' }}>Technologies Detected</p>
        </div>
        <div style={{ borderLeft: 'var(--glass-border)', paddingLeft: 16 }}>
          <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-4)' }}>50k+</span>
          <p className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, margin: '4px 0 0 0' }}>Reports Generated</p>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section style={{ textAlign: 'center' }}>
        <p className="eyebrow" style={{ color: 'var(--accent-3)' }}>Verification Pipeline</p>
        <h2 style={{ fontSize: 36, fontWeight: 800 }}>How GitIntel Analyzes Code</h2>
        <p className="muted" style={{ maxWidth: 500, margin: '0 auto 48px auto' }}>A multi-tiered static code analysis mapping repositories to objective skill metrics.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'left' }} className="timeline-path">
          <div className="panel" style={{ position: 'relative', background: 'var(--surface)' }}>
            <div className="timeline-dot"></div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--accent-3)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Step 01</span>
            <strong style={{ fontSize: 18, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Enter GitHub Username</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Simply input any public username. We authenticate dynamically and retrieve profile metadata along with public repository lists.</p>
          </div>
 
          <div className="panel" style={{ position: 'relative', background: 'var(--surface)' }}>
            <div className="timeline-dot" style={{ background: 'var(--accent)' }}></div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Step 02</span>
            <strong style={{ fontSize: 18, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>AI Repository Analysis</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Our engine crawls and analyzes repository settings, package dependency scopes, file trees, configuration maps, and commit patterns.</p>
          </div>
 
          <div className="panel" style={{ position: 'relative', background: 'var(--surface)' }}>
            <div className="timeline-dot" style={{ background: 'var(--success)' }}></div>
            <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--success)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Step 03</span>
            <strong style={{ fontSize: 18, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Developer Report Generated</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Within seconds, get scoring models, radar skill diagrams, role alignment recommendations, and candidate matching capabilities.</p>
          </div>
        </div>
      </section>

      {/* 4. FEATURE SHOWCASE */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div className="panel tilt-card">
          <div className="tilt-card-inner">
            <Cpu size={24} className="text-accent" style={{ color: 'var(--accent)', marginBottom: 16 }} />
            <strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>AI Skill Detection</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Identifies core stacks and parses libraries directly from codebase source folders, tracking usage depth.</p>
          </div>
        </div>

        <div className="panel tilt-card">
          <div className="tilt-card-inner">
            <Layers size={24} className="text-accent-3" style={{ color: 'var(--accent-3)', marginBottom: 16 }} />
            <strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>Complexity Scoring</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Uses AST parsing models to score repository architectural hierarchy, routing, state models, and test setups.</p>
          </div>
        </div>

        <div className="panel tilt-card">
          <div className="tilt-card-inner">
            <Award size={24} className="text-success" style={{ color: 'var(--success)', marginBottom: 16 }} />
            <strong style={{ fontSize: 18, display: 'block', marginBottom: 8 }}>Hiring Recommendations</strong>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>Delivers actionable strengths, risk warnings, and detailed technical profiles for recruitment evaluation.</p>
          </div>
        </div>
      </section>

      {/* 5. HEATMAP PREVIEW SECTION */}
      <section className="panel" style={{ background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}>Interactive Contribution Heatmap</h3>
            <p className="muted" style={{ fontSize: 12, margin: '4px 0 0 0' }}>Interactive calendar visualization mapping active development sequences.</p>
          </div>
          <span className="tech-chip" style={{ background: 'rgba(0,230,118,0.08)', color: 'var(--success)', fontWeight: 600 }}>Mock preview</span>
        </div>
        {/* Render a mock/empty heatmap using ActivityHeatmap with dummy data */}
        <ActivityHeatmap repositories={[]} />
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="panel" style={{ padding: '64px 32px', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(239, 28, 37, 0.05) 0%, transparent 80%), var(--surface)', border: '1px solid rgba(239, 28, 37, 0.15)' }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Ready to screen candidates objectively?</h2>
        <p className="muted" style={{ maxWidth: 500, margin: '0 auto 32px auto', fontSize: 15 }}>
          Enter a GitHub handle to immediately analyze public portfolios, scoring frameworks, cloud environments, and candidate alignments.
        </p>
        <button className="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span>Start Analysis Now</span>
          <ArrowRight size={16} />
        </button>
      </section>

      {/* 7. FOOTER */}
      <footer style={{ borderTop: 'var(--glass-border)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--muted)' }}>
        <div>
          <strong>GitIntel</strong> — Developer Intelligence Platform
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" className="muted" style={{ textDecoration: 'none' }}>Documentation</a>
          <a href="#" className="muted" style={{ textDecoration: 'none' }}>API Access</a>
          <a href="#" className="muted" style={{ textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
