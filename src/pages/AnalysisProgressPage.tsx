import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { api } from '../services/api';

const STEPS = [
  { id: 'profile', label: 'Fetching Profile' },
  { id: 'repos', label: 'Fetching Repositories' },
  { id: 'skills', label: 'Identifying Skills' },
  { id: 'contributions', label: 'Analyzing Contributions' },
  { id: 'report', label: 'Generating AI Report' }
];

export default function AnalysisProgressPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;

    let isMounted = true;

    const performAnalysis = async () => {
      try {
        // We will mock the progress steps for UI effect while the actual API call runs
        const stepInterval = setInterval(() => {
          if (isMounted) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
          }
        }, 800);

        // Actual API call which might take a few seconds
        await api.analyze(username);

        clearInterval(stepInterval);
        
        if (isMounted) {
          setCurrentStep(STEPS.length);
          setTimeout(() => navigate(`/report/${username}`), 500);
        }
      } catch (err: any) {
        if (isMounted) {
          const errMsg = err.message || '';
          if (errMsg.includes('403') || errMsg.toLowerCase().includes('rate limit')) {
            let resetTime = null;
            if (errMsg.includes('|RESET:')) {
              resetTime = errMsg.split('|RESET:')[1];
            }
            navigate('/setup', { state: { resetTime } });
          } else {
            setError(errMsg.split('|RESET:')[0] || 'Analysis failed. Please check the username and try again.');
          }
        }
      }
    };

    performAnalysis();

    return () => { isMounted = false; };
  }, [username, navigate]);

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card fade-in-up" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2rem' }}>
        <h2 className="text-center mb-8" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Analyzing Candidate <span className="gradient-text">@{username}</span>
        </h2>

        {error ? (
          <div className="text-center">
            <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>
              <CheckCircle size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
            </div>
            <p className="font-bold" style={{ color: 'var(--danger-color)' }}>{error}</p>
            <button className="btn mt-6" onClick={() => navigate('/')}>Return Home</button>
          </div>
        ) : (
          <div className="flex-col gap-6">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              const isPending = currentStep < index;

              return (
                <div key={step.id} className="flex items-center gap-4" style={{ opacity: isPending ? 0.4 : 1, transition: 'var(--transition)' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isCompleted ? 'var(--success-color)' : (isCurrent ? 'var(--accent-color)' : 'var(--border-color)'),
                    color: isCompleted || isCurrent ? 'white' : 'var(--text-secondary)'
                  }}>
                    {isCompleted ? <CheckCircle size={18} /> : (isCurrent ? <Loader size={18} className="animate-spin" /> : index + 1)}
                  </div>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
