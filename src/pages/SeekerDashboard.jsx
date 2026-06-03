import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockJobs } from '../data/mockJobs';
import { getRecommendedJobs, getProfileCompletion } from '../data/profileStorage';
import { LogOut, ArrowLeft, Edit2, MapPin, Briefcase, Bookmark, Sparkles, FileText, ExternalLink } from 'lucide-react';

const STATUS_COLORS = {
  Applied: { bg: 'rgba(161,161,170,0.15)', color: '#a1a1aa', label: 'Applied' },
  Viewed: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', label: '👀 Viewed' },
  Shortlisted: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '⭐ Shortlisted' },
  Rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', label: '✕ Rejected' },
};

function JobCard({ job, statusBadge, ctaLabel, onCta, onMapView }) {
  return (
    <div className="dash-job-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{job.jobLogo || job.logo || '💼'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{job.jobTitle || job.title}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{job.jobCompany || job.company}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            📍 {job.jobLocation || job.location}
            {job.salary && <span> • {job.salary}</span>}
            {job.type && <span> • {job.type}</span>}
          </div>
          {job.appliedAt && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Applied {new Date(job.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {statusBadge && (
            <span className="status-badge" style={{ background: STATUS_COLORS[statusBadge]?.bg, color: STATUS_COLORS[statusBadge]?.color }}>
              {STATUS_COLORS[statusBadge]?.label || statusBadge}
            </span>
          )}
          {ctaLabel && (
            <button className="btn-submit" style={{ fontSize: '0.75rem', padding: '5px 12px' }} onClick={onCta}>
              {ctaLabel}
            </button>
          )}
          {onMapView && (
            <button className="clear-btn" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }} onClick={onMapView}>
              <MapPin size={10} /> View on map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeekerDashboard() {
  const { user, profile, applications, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');

  const handleLogout = () => { logout(); navigate('/'); };

  // Saved jobs from localStorage
  const savedJobIds = useMemo(() => {
    try {
      const s = localStorage.getItem('geojobs_saved');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  }, []);

  const savedJobs = useMemo(() =>
    mockJobs.filter((j) => savedJobIds.includes(j.id)),
    [savedJobIds]
  );

  const recommendedJobs = useMemo(() =>
    getRecommendedJobs(profile, mockJobs),
    [profile]
  );

  const completion = getProfileCompletion(profile);

  if (!user || user.role !== 'seeker') {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <button className="btn-cancel" onClick={() => navigate('/')}>Return to Map</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Map
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/profile')}>
            <FileText size={14} /> View Profile
          </button>
          <button className="btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        {/* ── Left: Profile Sidebar ── */}
        <aside className="dashboard-sidebar">
          <div className="profile-sidebar-card">
            <div className="profile-avatar-xl" style={{ fontSize: '3rem', textAlign: 'center', display: 'block', marginBottom: '12px' }}>
              {profile?.avatar || user.avatar}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '3px' }}>{profile?.name || user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 500 }}>{profile?.headline || 'No headline yet'}</div>
              {profile?.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {profile.location}</div>}
              {profile?.currentRole && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {profile.currentRole}{profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
                </div>
              )}
            </div>

            {/* Profile completion meter */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Profile strength</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: completion >= 70 ? 'var(--accent-emerald)' : '#f59e0b' }}>{completion}%</span>
              </div>
              <div className="completion-bar-bg">
                <div className="completion-bar-fill" style={{ width: `${completion}%`, background: completion >= 70 ? 'var(--accent-emerald)' : '#f59e0b' }} />
              </div>
            </div>

            {/* Top skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '14px', justifyContent: 'center' }}>
                {profile.skills.slice(0, 8).map((s) => (
                  <span key={s} className="skill-chip">{s}</span>
                ))}
              </div>
            )}

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {profile?.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem' }}>
                  💼 LinkedIn <ExternalLink size={10} />
                </a>
              )}
              {profile?.resumeLink && (
                <a href={profile.resumeLink} target="_blank" rel="noreferrer" className="profile-link-btn" style={{ fontSize: '0.78rem' }}>
                  📄 Resume <ExternalLink size={10} />
                </a>
              )}
            </div>

            <button
              className="btn-submit"
              style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px' }}
              onClick={() => navigate('/profile/setup')}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          </div>

          {/* Quick stats */}
          <div className="dashboard-stats-grid">
            <div className="dash-stat-box">
              <div className="dash-stat-num">{applications.length}</div>
              <div className="dash-stat-lbl">Applied</div>
            </div>
            <div className="dash-stat-box">
              <div className="dash-stat-num">{applications.filter(a => a.status === 'Shortlisted').length}</div>
              <div className="dash-stat-lbl">Shortlisted</div>
            </div>
            <div className="dash-stat-box">
              <div className="dash-stat-num">{savedJobs.length}</div>
              <div className="dash-stat-lbl">Saved</div>
            </div>
            <div className="dash-stat-box">
              <div className="dash-stat-num">{recommendedJobs.length}</div>
              <div className="dash-stat-lbl">Matches</div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="dashboard-main">
          {/* Tabs */}
          <div className="dash-tabs">
            <button className={`dash-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
              <Briefcase size={15} /> Applications
              {applications.length > 0 && <span className="tab-count">{applications.length}</span>}
            </button>
            <button className={`dash-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>
              <Bookmark size={15} /> Saved Jobs
              {savedJobs.length > 0 && <span className="tab-count">{savedJobs.length}</span>}
            </button>
            <button className={`dash-tab ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => setActiveTab('recommended')}>
              <Sparkles size={15} /> Recommended
              {recommendedJobs.length > 0 && <span className="tab-count">{recommendedJobs.length}</span>}
            </button>
          </div>

          {/* ── Tab: Applications ── */}
          {activeTab === 'applications' && (
            <div className="tab-content">
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                  <h3>No applications yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Go back to the map, find a job that excites you, and apply with one click.
                  </p>
                  <button className="btn-submit" onClick={() => navigate('/')}>Explore Jobs on Map</button>
                </div>
              ) : (
                <div className="dash-cards-list">
                  {applications.map((app) => (
                    <div key={app.id} className="dash-job-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{app.jobLogo || '💼'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{app.jobTitle}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{app.jobCompany}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>📍 {app.jobLocation}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Applied {new Date(app.appliedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {app.coverNote && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic', borderLeft: '2px solid var(--panel-border)', paddingLeft: '8px' }}>
                              "{app.coverNote.slice(0, 120)}{app.coverNote.length > 120 ? '…' : ''}"
                            </div>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span className="status-badge" style={{ background: STATUS_COLORS[app.status]?.bg, color: STATUS_COLORS[app.status]?.color }}>
                            {STATUS_COLORS[app.status]?.label || app.status}
                          </span>
                          <button className="clear-btn" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }} onClick={() => navigate('/')}>
                            <MapPin size={10} /> View on map
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Saved Jobs ── */}
          {activeTab === 'saved' && (
            <div className="tab-content">
              {savedJobs.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔖</div>
                  <h3>No bookmarks yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Tap the ⭐ bookmark icon on any job to save it here for later.
                  </p>
                  <button className="btn-submit" onClick={() => navigate('/')}>Browse Jobs</button>
                </div>
              ) : (
                <div className="dash-cards-list">
                  {savedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      ctaLabel="Apply Now"
                      onCta={() => navigate('/')}
                      onMapView={() => navigate('/')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Recommended ── */}
          {activeTab === 'recommended' && (
            <div className="tab-content">
              {!profile?.skills?.length ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✨</div>
                  <h3>Add skills to see matches</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    We match your skills to job descriptions. Add skills to your profile to unlock recommendations.
                  </p>
                  <button className="btn-submit" onClick={() => navigate('/profile/setup')}>Add Skills</button>
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                  <h3>No matches yet</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>We couldn't find jobs matching your skills. Try adding more skills to your profile.</p>
                </div>
              ) : (
                <>
                  <div className="recommended-header">
                    <Sparkles size={16} color="var(--accent-amber)" />
                    Based on your skills: <strong>{profile.skills.slice(0, 4).join(', ')}{profile.skills.length > 4 ? '…' : ''}</strong>
                  </div>
                  <div className="dash-cards-list">
                    {recommendedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        ctaLabel="Apply Now"
                        onCta={() => navigate('/')}
                        onMapView={() => navigate('/')}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
