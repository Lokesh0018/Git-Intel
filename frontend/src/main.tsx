import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RecruiterMatchPage from './pages/RecruiterMatchPage';
import SettingsPage from './pages/SettingsPage';
import AnalysisLoadingPage from './pages/AnalysisLoadingPage';
import SkillsAnalyticsPage from './pages/SkillsAnalyticsPage';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main App Routes wrapped in the Sidebar Shell */}
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard/:username?" element={<DashboardPage />} />
            <Route path="skills/:username?" element={<SkillsAnalyticsPage />} />
            <Route path="match/:username?" element={<RecruiterMatchPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="analyze/:username" element={<AnalysisLoadingPage />} />
          </Route>
          {/* Standalone profile & share routes (no sidebar for sharing / print portfolios) */}
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="share/:token" element={<ProfilePage />} />
          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
