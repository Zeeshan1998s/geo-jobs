import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApplicationsByEmployer } from '../data/profileStorage';
import { LogOut, ArrowLeft, Edit2, Users, Briefcase, ExternalLink } from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Viewed', 'Shortlisted', 'Rejected'];
const STATUS_COLORS = {
  Applied: { bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa' },
  Viewed: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  Shortlisted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
};

export default function EmployerDashboard() {
  const { user, profile, updateAppStatus, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applicants');
  const [expandedApplicant, setExpandedApplicant] = useState(null);

  const handleLogout = () => { logout(); navigate('/'); };

  // Load all applications for this employer
  const [applications, setApplications] = useState(() =>
    user ? getApplicationsByEmployer(user.id) : []
  );

  const handleStatusChange = (appId, newStatus) => {
    updateAppStatus(appId, newStatus);
    setApplications((prev) =>
      prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a)
    );
  };

  if (!user || user.role !== 'employer') {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <button className="btn-cancel" onClick={() => navigate('/')}>Return to Map</button>
      </div>
    );
  }

  const shortlisted = applications.filter(a => a.status === 'Shortlisted').length;

  return (
    <div className="dashboard-page">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Map
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/profile/employer-setup')}>
            <Edit2 size={14} /> Edit Company Profile
          </button>
          <button className="btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        {/* ── Left: Company Sidebar ── */}
        <aside className="dashboard-sidebar">
          <div className="profile-sidebar-card">
            <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '12px' }}>
              {profile?.avatar || '🏢'}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '3px' }}>{profile?.companyName || user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 500 }}>{profile?.tagline || 'No tagline yet'}</div>
              {profile?.hqCity && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {profile.hqCity}</div>}
              {profile?.companySize && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>👥 {profile.companySize}</div>}
              {profile?.industry && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>🏭 {profile.industry}</div>}
            </div>

            {profile?.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem', marginBottom: '12px' }}>
                🌐 Website <ExternalLink size={10} />
              </a>
            )}

            <button
              className="btn-submit"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }}
              onClick={() => navigate('/profile/employer-setup')}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="dashboard-stats-grid">
            <div className="dash-stat-box">
              <div className="dash-stat-num">{applications.length}</div>
              <div className="dash-stat-lbl">Total Applicants</div>
            </div>
            <div className="dash-stat-box">
              <div className="dash-stat-num" style={{ color: 'var(--accent-emerald)' }}>{shortlisted}</div>
              <div className="dash-stat-lbl">Shortlisted</div>
            </div>
          </div>

          <div className="dash-tip-box">
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>💡 Tip</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Double-click anywhere on the map to pin a new job at the exact office location. Job seekers worldwide can find it!
            </p>
            <button className="clear-btn" style={{ fontSize: '0.78rem', marginTop: '8px' }} onClick={() => navigate('/')}>
              Post a Job on Map →
            </button>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="dashboard-main">
          <div className="dash-tabs">
            <button className={`dash-tab ${activeTab === 'applicants' ? 'active' : ''}`} onClick={() => setActiveTab('applicants')}>
              <Users size={15} /> Applicants
              {applications.length > 0 && <span className="tab-count">{applications.length}</span>}
            </button>
            <button className={`dash-tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={15} /> Active Listings
            </button>
          </div>

          {/* ── Tab: Applicants ── */}
          {activeTab === 'applicants' && (
            <div className="tab-content">
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                  <h3>No applicants yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Post jobs on the map to start receiving applications from candidates worldwide.
                  </p>
                  <button className="btn-submit" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }} onClick={() => navigate('/')}>
                    Post a Job on Map
                  </button>
                </div>
              ) : (
                <div className="dash-cards-list">
                  {applications.map((app) => (
                    <div key={app.id} className="applicant-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Avatar */}
                        <span style={{ fontSize: '2rem', flexShrink: 0 }}>{app.seekerAvatar || '👤'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{app.seekerName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginBottom: '4px' }}>{app.seekerHeadline}</div>
                          {/* Top 3 skills */}
                          {app.seekerSkills?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                              {app.seekerSkills.slice(0, 3).map((s) => (
                                <span key={s} className="skill-chip" style={{ fontSize: '0.68rem' }}>{s}</span>
                              ))}
                              {app.seekerSkills.length > 3 && (
                                <span className="skill-chip" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{app.seekerSkills.length - 3}</span>
                              )}
                            </div>
                          )}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Applied for <strong style={{ color: 'var(--text-primary)' }}>{app.jobTitle}</strong> •{' '}
                            {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          {/* Status dropdown */}
                          <select
                            className="status-select"
                            value={app.status}
                            style={{ background: STATUS_COLORS[app.status]?.bg, color: STATUS_COLORS[app.status]?.color }}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            className="clear-btn"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => setExpandedApplicant(expandedApplicant === app.id ? null : app.id)}
                          >
                            {expandedApplicant === app.id ? 'Collapse ▲' : 'View Profile ▼'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded applicant profile */}
                      {expandedApplicant === app.id && (
                        <div className="applicant-expanded">
                          {app.coverNote && (
                            <div className="applicant-cover-note">
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px' }}>COVER NOTE</div>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{app.coverNote}"</p>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {app.seekerLinkedin && (
                              <a href={app.seekerLinkedin} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem' }}>
                                💼 LinkedIn <ExternalLink size={10} />
                              </a>
                            )}
                            {app.seekerResume && (
                              <a href={app.seekerResume} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem' }}>
                                📄 Resume <ExternalLink size={10} />
                              </a>
                            )}
                            {app.seekerPortfolio && (
                              <a href={app.seekerPortfolio} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem' }}>
                                🌐 Portfolio <ExternalLink size={10} />
                              </a>
                            )}
                            {!app.seekerLinkedin && !app.seekerResume && !app.seekerPortfolio && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No links provided</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Active Listings ── */}
          {activeTab === 'jobs' && (
            <div className="tab-content">
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗺️</div>
                <h3>Your jobs live on the map</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '380px' }}>
                  All jobs you've pinned are visible to seekers on the interactive world map. Double-click any spot on the map to add a new job at that exact location.
                </p>
                <button className="btn-submit" style={{ background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }} onClick={() => navigate('/')}>
                  Go to Map & Post Jobs
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
