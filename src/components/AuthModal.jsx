import React, { useState } from 'react';
import { X, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('seeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const newUser = login(email, password, role);
    onClose();

    // After sign-up (not login), redirect to profile setup
    if (!isLogin) {
      if (role === 'employer') {
        navigate('/profile/employer-setup');
      } else {
        navigate('/profile/setup');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isLogin ? 'Welcome Back 👋' : 'Join GeoJobs 🌐'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">

            {/* Role selector — only on sign up */}
            {!isLogin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`role-select-btn ${role === 'seeker' ? 'seeker-active' : ''}`}
                >
                  <User size={20} color={role === 'seeker' ? 'var(--accent-purple)' : 'var(--text-secondary)'} />
                  <span>Job Seeker</span>
                  <span className="role-desc">Find your next role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`role-select-btn ${role === 'employer' ? 'employer-active' : ''}`}
                >
                  <Briefcase size={20} color={role === 'employer' ? 'var(--accent-emerald)' : 'var(--text-secondary)'} />
                  <span>Employer</span>
                  <span className="role-desc">Hire top talent</span>
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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: 'var(--accent-crimson)', fontSize: '0.82rem', marginTop: '-8px', marginBottom: '10px' }}>
                ⚠️ {error}
              </div>
            )}

            {!isLogin && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                After creating your account you'll be taken to a quick profile setup. It only takes 2 minutes!
              </p>
            )}

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" className="clear-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                  {isLogin ? 'Sign up free' : 'Log in'}
                </button>
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-submit" style={{ width: '100%', padding: '12px' }}>
              {isLogin ? 'Log In' : `Create Account as ${role === 'employer' ? 'Employer' : 'Job Seeker'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
