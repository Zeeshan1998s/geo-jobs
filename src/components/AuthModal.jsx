import React, { useState } from 'react';
import { X, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('seeker'); // 'seeker' or 'employer'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Simulate auth action
    login(email, password, role);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            {!isLogin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${role === 'seeker' ? 'var(--accent-purple)' : 'var(--panel-border)'}`,
                    background: role === 'seeker' ? 'rgba(139, 92, 246, 0.1)' : 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <User size={20} color={role === 'seeker' ? 'var(--accent-purple)' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${role === 'employer' ? 'var(--accent-emerald)' : 'var(--panel-border)'}`,
                    background: role === 'employer' ? 'rgba(16, 185, 129, 0.1)' : 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Briefcase size={20} color={role === 'employer' ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Employer</span>
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  className="clear-btn" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-submit" style={{ width: '100%', padding: '12px' }}>
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
