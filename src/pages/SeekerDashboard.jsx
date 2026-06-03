import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';

export default function SeekerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'seeker') {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <button className="btn-cancel" onClick={() => navigate('/')}>Return to Map</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }} onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Map
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem' }}>Job Seeker Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name}!</p>
        </div>
        <button className="btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent-purple)' }}>Saved Jobs</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have 0 saved jobs. Go back to the map to bookmark some roles.</p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--accent-emerald)' }}>Applications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't applied to any jobs yet.</p>
        </div>
      </div>
    </div>
  );
}
