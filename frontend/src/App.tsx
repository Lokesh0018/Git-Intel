import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, BarChart3, UserCheck, Settings, Github, Check, HelpCircle, Terminal } from 'lucide-react';
import { useAuth } from './context/AuthContext';

interface CommandOption {
  label: string;
  action: () => void;
  shortcut?: string;
  category: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const { activeUsername } = useAuth();

  // Toast System State
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  // Command Palette State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Global Toast event handler
  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = Math.random().toString();
      setToasts((prev) => [...prev, { id, message: detail.message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }

      // Alt + numbers to navigate
      if (e.altKey && !isPaletteOpen) {
        if (e.key === '1') { e.preventDefault(); navigate('/'); }
        if (e.key === '2') { e.preventDefault(); navigate('/dashboard'); }
        if (e.key === '3') { e.preventDefault(); navigate('/skills'); }
        if (e.key === '4') { e.preventDefault(); navigate('/match'); }
        if (e.key === '5') { e.preventDefault(); navigate('/settings'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isPaletteOpen]);

  // Command Palette options definitions
  const commandOptions: CommandOption[] = [
    { label: 'Analyze New Developer', category: 'Navigation', shortcut: 'Alt+1', action: () => { navigate('/'); setIsPaletteOpen(false); } },
    { label: 'View Reports Dashboard', category: 'Navigation', shortcut: 'Alt+2', action: () => { navigate('/dashboard'); setIsPaletteOpen(false); } },
    { label: 'Open Skills Analytics', category: 'Navigation', shortcut: 'Alt+3', action: () => { navigate('/skills'); setIsPaletteOpen(false); } },
    { label: 'Run Recruiter Job Matcher', category: 'Navigation', shortcut: 'Alt+4', action: () => { navigate('/match'); setIsPaletteOpen(false); } },
    { label: 'Open Platform Settings', category: 'Navigation', shortcut: 'Alt+5', action: () => { navigate('/settings'); setIsPaletteOpen(false); } },
    { label: 'Quick Search Profile', category: 'Actions', shortcut: 'Type username', action: () => {
      const u = prompt('Enter GitHub username to analyze:');
      if (u) {
        navigate(`/analyze/${u.trim()}`);
      }
      setIsPaletteOpen(false);
    }},
    { label: 'Clear Local Storage Cache', category: 'System', action: () => {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Cache cleared successfully!' } }));
      setIsPaletteOpen(false);
    }}
  ];

  // Filtering palette results
  const filteredOptions = commandOptions.filter((opt) =>
    opt.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
    opt.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[selectedIdx]) {
        filteredOptions[selectedIdx].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsPaletteOpen(false);
    }
  };

  useEffect(() => {
    setSelectedIdx(0);
  }, [paletteSearch]);

  return (
    <div className="shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Github size={20} strokeWidth={2.5} />
          </span>
          <span>
            <strong>GitIntel</strong>
            <small>Developer Intelligence</small>
          </span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <Search size={18} />
            <span>Analyze</span>
          </NavLink>
          <NavLink to={activeUsername ? `/dashboard/${activeUsername}` : "/dashboard"} className={({ isActive }) => (isActive ? 'active' : '')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to={activeUsername ? `/skills/${activeUsername}` : "/skills"} className={({ isActive }) => (isActive ? 'active' : '')}>
            <BarChart3 size={18} />
            <span>Skills Analytics</span>
          </NavLink>
          <NavLink to={activeUsername ? `/match/${activeUsername}` : "/match"} className={({ isActive }) => (isActive ? 'active' : '')}>
            <UserCheck size={18} />
            <span>Recruiter Match</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        {/* Command palette hint */}
        <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setIsPaletteOpen(true)}>
          <Terminal size={14} />
          <span>Press <strong>Ctrl + K</strong> to navigate</span>
        </div>

        <div className="session">
          <span className="session-email">Public Mode</span>
        </div>
      </aside>

      {/* MAIN LAYOUT CONTENT */}
      <main className="content">
        <Outlet />
      </main>

      {/* GLOBAL TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <Check size={16} className="text-success" style={{ color: 'var(--success)' }} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* COMMAND PALETTE BACKDROP */}
      {isPaletteOpen && (
        <div className="command-palette-backdrop" onClick={() => setIsPaletteOpen(false)}>
          <div className="command-palette" onClick={(e) => e.stopPropagation()}>
            <div className="command-palette-input-wrapper">
              <Search size={18} className="muted" />
              <input
                autoFocus
                className="command-palette-input"
                placeholder="Search commands or actions..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                onKeyDown={handlePaletteKeyDown}
              />
              <span className="command-shortcut" style={{ fontSize: 9 }}>ESC</span>
            </div>

            <div className="command-palette-results">
              {filteredOptions.map((opt, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={opt.label}
                    className={`command-option ${isSelected ? 'selected' : ''}`}
                    onClick={opt.action}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 8 }}>{opt.category}</span>
                      <span>{opt.label}</span>
                    </div>
                    {opt.shortcut && <span className="command-shortcut">{opt.shortcut}</span>}
                  </button>
                );
              })}
              {filteredOptions.length === 0 && (
                <p className="muted" style={{ padding: 16, textAlign: 'center', fontSize: 13, margin: 0 }}>No actions match search query.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
