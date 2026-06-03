import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Plus } from 'lucide-react';

export default function EmployerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'employer') {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Unauthorized Access</h2>
        <button className="btn-cancel" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }} onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Map
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem' }}>Employer Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Managing listings for {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-post-job" onClick={() => navigate('/')}>
            <Plus size={16} /> New Listing on Map
          </button>
          <button className="btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--accent-emerald)' }}>Active Candidates Pipeline</h3>
        
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              <th style={{ paddingBottom: '10px' }}>Job Role</th>
              <th style={{ paddingBottom: '10px' }}>Applicant Name</th>
              <th style={{ paddingBottom: '10px' }}>Status</th>
              <th style={{ paddingBottom: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active candidates. Try posting a new job on the map!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
