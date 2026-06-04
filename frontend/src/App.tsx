import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Search, LayoutDashboard, UserCheck, Settings, LogOut, Github } from 'lucide-react';

const App: React.FC = () => {
  const { email, isAuthenticated, logout } = useAuth();

  return (
    <div className="shell">
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
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/match" className={({ isActive }) => (isActive ? 'active' : '')}>
            <UserCheck size={18} />
            <span>Recruiter Match</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="session">
          <span className="session-email">{email || 'Guest session'}</span>
          {isAuthenticated && (
            <button className="ghost sign-out-btn" onClick={logout}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
