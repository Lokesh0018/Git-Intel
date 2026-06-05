import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const AuthPanel: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register(email, password);
      
      login(result.user.email, result.token);
      setSuccess(mode === 'login' ? 'Successfully logged in!' : 'Account registered successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div className="segmented">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
        >
          Register
        </button>
      </div>
      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            placeholder="recruiter@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            placeholder="8+ characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="error message-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </p>
        )}
        {success && (
          <p className="success message-box">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </p>
        )}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>
    </section>
  );
};

export default AuthPanel;
