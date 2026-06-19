import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { Briefcase, Settings, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AnalysisProgressPage from './pages/AnalysisProgressPage';
import ReportPage from './pages/ReportPage';
import JobMatchPage from './pages/JobMatchPage';
import ComparisonPage from './pages/ComparisonPage';
import TalentPoolPage from './pages/TalentPoolPage';
import SkillBenchmarkPage from './pages/SkillBenchmarkPage';
import ApiSetupPage from './pages/ApiSetupPage';
import SettingsModal from './components/SettingsModal';
import './styles/main.css';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gitintel_theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('gitintel_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('gitintel_theme', 'dark');
      setIsDarkMode(true);
    }
  };

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
              <NavLink to="/" className="nav-link" end>Analyze</NavLink>
              <NavLink to="/talent-pool" className="nav-link">Talent Pool</NavLink>
              <NavLink to="/job-match" className="nav-link">Role Analysis</NavLink>
              <NavLink to="/compare" className="nav-link">Compare</NavLink>
              <NavLink to="/benchmark" className="nav-link">Skill Benchmark</NavLink>
              <div className="flex gap-2">
                <button 
                  onClick={toggleTheme}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem' }}
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', gap: '0.4rem' }}
                  title="Settings"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </div>
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
            <Route path="/setup" element={<ApiSetupPage />} />
          </Routes>
        </main>
        
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
