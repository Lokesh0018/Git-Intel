import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Briefcase, Settings } from 'lucide-react';
import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import AnalysisProgressPage from './pages/AnalysisProgressPage';
import ReportPage from './pages/ReportPage';
import JobMatchPage from './pages/JobMatchPage';
import ComparisonPage from './pages/ComparisonPage';
import TalentPoolPage from './pages/TalentPoolPage';
import SkillBenchmarkPage from './pages/SkillBenchmarkPage';
import SettingsModal from './components/SettingsModal';
import './styles/main.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <header className="header">
          <div className="container header-content">
            <Link to="/" className="logo">
              <Briefcase size={28} color="var(--accent-color)" />
              GitIntel
            </Link>
            <nav className="nav-links">
              <Link to="/" className="nav-link">Analyze</Link>
              <Link to="/talent-pool" className="nav-link">Talent Pool</Link>
              <Link to="/job-match" className="nav-link">Role Analysis</Link>
              <Link to="/compare" className="nav-link">Compare</Link>
              <Link to="/benchmark" className="nav-link">Skill Benchmark</Link>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', gap: '0.4rem' }}
                title="Settings"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/analyzing/:username" element={<AnalysisProgressPage />} />
            <Route path="/report/:username" element={<ReportPage />} />
            <Route path="/job-match" element={<JobMatchPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/talent-pool" element={<TalentPoolPage />} />
            <Route path="/benchmark" element={<SkillBenchmarkPage />} />
          </Routes>
        </main>
        
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
