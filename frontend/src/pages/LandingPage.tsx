import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Target, BarChart2, Briefcase, FileText, CheckCircle, Shield, Award, Users } from 'lucide-react';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/analyzing/${username}`, { state: { jobDescription: jobDesc } });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="container" style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '900px' }}>
        <h1 className="fade-in-up" style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>
          Analyze GitHub Profiles Like <span className="gradient-text">Never Before</span>
        </h1>
        <p className="text-secondary fade-in-up" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem', animationDelay: '0.1s' }}>
          GitIntel is an AI-powered Candidate Intelligence Platform designed for recruiters and engineering managers to evaluate developer talent using real GitHub evidence.
        </p>

        <div className="card fade-in-up" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', animationDelay: '0.2s', padding: '2rem' }}>
          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">GitHub Username *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., torvalds" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ fontSize: '1.1rem', padding: '1rem' }}
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              <Search size={22} />
              Generate Intelligence Report
            </button>
          </form>
        </div>
      </section>

      {/* Stats/Trusted By Section */}
      <section style={{ backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '3rem 0' }}>
        <div className="container flex justify-between" style={{ maxWidth: '1000px', textAlign: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div className="text-xl font-bold" style={{ fontSize: '2rem' }}>10k+</div>
            <div className="text-secondary text-sm">Candidates Analyzed</div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ fontSize: '2rem' }}>95%</div>
            <div className="text-secondary text-sm">Hiring Accuracy</div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ fontSize: '2rem' }}>50+</div>
            <div className="text-secondary text-sm">Metrics Evaluated</div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ fontSize: '2rem' }}>0</div>
            <div className="text-secondary text-sm">Bias in Evaluation</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ padding: '6rem 2rem' }}>
        <div className="text-center" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Everything you need to hire right</h2>
          <p className="text-secondary" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            A comprehensive suite of tools designed to take the guesswork out of technical hiring.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              <Brain size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Intelligence Reports</h3>
            <p className="text-secondary">Get recruiter-friendly summaries, experience estimations, and verifiable skill confidence scores instantly.</p>
          </div>
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#F5F3FF', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--accent-tertiary)' }}>
              <Target size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Role Fit Analysis</h3>
            <p className="text-secondary">Automatically map candidate skills against predefined roles (Frontend, Backend, DevOps) to determine job fit.</p>
          </div>
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--success-color)' }}>
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Candidate Comparison</h3>
            <p className="text-secondary">Compare multiple candidates side-by-side on key metrics like project quality, consistency, and overall score.</p>
          </div>
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--warning-color)' }}>
              <Briefcase size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Talent Pool Management</h3>
            <p className="text-secondary">Save top candidates to your local talent pool. Filter and organize by role, seniority, and tech stack.</p>
          </div>
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--danger-color)' }}>
              <BarChart2 size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Skill Benchmarking</h3>
            <p className="text-secondary">See how candidates stack up against market averages in specific technologies like React, Python, or Java.</p>
          </div>
          <div className="card">
            <div style={{ padding: '1rem', backgroundColor: '#F1F5F9', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">PDF Report Export</h3>
            <p className="text-secondary">Generate beautiful, branded PDF hiring reports to share with hiring managers and team members.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ backgroundColor: 'var(--surface-color)', padding: '6rem 0' }}>
        <div className="container">
          <h2 className="text-center" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4rem' }}>How It Works</h2>
          <div className="grid-3 text-center">
            <div>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>1</div>
              <h3 className="text-xl font-bold mb-2">Enter Username</h3>
              <p className="text-secondary">Provide any valid GitHub username. No authentication required.</p>
            </div>
            <div>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>2</div>
              <h3 className="text-xl font-bold mb-2">AI Generates Report</h3>
              <p className="text-secondary">Our engine evaluates repositories, activity, and code quality.</p>
            </div>
            <div>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem' }}>3</div>
              <h3 className="text-xl font-bold mb-2">Save & Compare</h3>
              <p className="text-secondary">Save candidates to your talent pool and export hiring reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="container" style={{ padding: '6rem 2rem' }}>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))', color: 'white', border: 'none' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={32} />
            Quick Start Guide
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem', lineHeight: '2' }}>
            <li className="flex items-center gap-4 mb-4"><Shield size={20} /> 1. Scroll up and enter a valid GitHub username.</li>
            <li className="flex items-center gap-4 mb-4"><Shield size={20} /> 2. Wait a few seconds for the intelligence report generation.</li>
            <li className="flex items-center gap-4 mb-4"><Shield size={20} /> 3. Review the AI summary and verifiable skills.</li>
            <li className="flex items-center gap-4 mb-4"><Shield size={20} /> 4. Save the candidate if they meet your requirements.</li>
            <li className="flex items-center gap-4"><Shield size={20} /> 5. Navigate to Talent Pool to compare candidates and export reports.</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ backgroundColor: 'var(--surface-color)', padding: '6rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container grid-2">
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Get in Touch</h2>
            <p className="text-secondary mb-8">Have questions about GitIntel or want to request a feature? Send us a message.</p>
            
            <div className="flex-col gap-4 mb-8 text-secondary">
              <p><strong>Email:</strong> contact@gitintel.app</p>
              <p><strong>Website:</strong> www.gitintel.app</p>
              <p><strong>LinkedIn:</strong> /company/gitintel</p>
              <p><strong>GitHub:</strong> /gitintel</p>
            </div>
          </div>
          
          <div className="card" style={{ marginBottom: 0 }}>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! (Mocked for demo)'); }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={4} required></textarea>
              </div>
              <button type="submit" className="btn" style={{ width: '100%' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8" style={{ borderBottom: '1px solid #1E293B', paddingBottom: '2rem' }}>
            <div className="logo" style={{ color: 'white' }}>
              <Briefcase size={28} />
              GitIntel
            </div>
            <div className="flex gap-6">
              <a href="/" style={{ color: '#94A3B8' }}>Home</a>
              <a href="/talent-pool" style={{ color: '#94A3B8' }}>Talent Pool</a>
              <a href="/compare" style={{ color: '#94A3B8' }}>Compare</a>
              <a href="/benchmark" style={{ color: '#94A3B8' }}>Benchmark</a>
            </div>
          </div>
          <div className="text-center text-sm">
            &copy; {new Date().getFullYear()} GitIntel Platform. All rights reserved. Built for modern recruitment.
          </div>
        </div>
      </footer>
    </div>
  );
}
