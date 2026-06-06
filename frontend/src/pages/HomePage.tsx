import React from 'react';
import UsernameAnalyzer from '../components/UsernameAnalyzer';
import AuthPanel from '../components/AuthPanel';
import { useAuth } from '../context/AuthContext';
import { Award, Shield, Cpu, Layers } from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-grid">
      {/* Search analyzer container */}
      <UsernameAnalyzer />

      {/* Recruiter sidebar/workspace auth box */}
      {!isAuthenticated ? (
        <AuthPanel />
      ) : (
        <section className="panel workspace-ready-panel">
          <p className="eyebrow">Recruiter Active Session</p>
          <h2>Recruiter Workspace Ready</h2>
          <p>
            You are authenticated. You can now analyze developer profiles, run recruiter-candidate job matches, and export detailed PDF/JSON evidence reports.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <Cpu size={16} />
              <span>AI Engineering Analysis</span>
            </div>
            <div className="feature-item">
              <Layers size={16} />
              <span>Complexity Scoring</span>
            </div>
            <div className="feature-item">
              <Shield size={16} />
              <span>Security & DevOps Audits</span>
            </div>
            <div className="feature-item">
              <Award size={16} />
              <span>Recruiter Job Matcher</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
