import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileCompletion } from '../data/profileStorage';
import { Edit2, ExternalLink, ArrowLeft, Briefcase, MapPin, Award } from 'lucide-react';

export default function ProfileView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/'); return null; }

  const isEmployer = user.role === 'employer';
  const completion = isEmployer ? (profile ? 100 : 0) : getProfileCompletion(profile);

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <button className="clear-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn-submit"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
          onClick={() => navigate(isEmployer ? '/profile/employer-setup' : '/profile/setup')}
        >
          <Edit2 size={14} /> Edit Profile
        </button>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '30px 20px' }}>
        {!profile ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👤</div>
            <h2>No profile yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Set up your profile to apply to jobs with one click.
            </p>
            <button className="btn-submit" onClick={() => navigate(isEmployer ? '/profile/employer-setup' : '/profile/setup')}>
              Create Profile
            </button>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="profile-card-large">
              <div className="profile-card-top">
                <span className="profile-avatar-xl">{profile.avatar || user.avatar}</span>
                <div className="profile-card-info">
                  <h1 className="profile-card-name">{profile.name || profile.companyName}</h1>
                  <p className="profile-card-headline">{profile.headline || profile.tagline}</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {(profile.location || profile.hqCity) && (
                      <span className="profile-meta-chip"><MapPin size={12} /> {profile.location || profile.hqCity}</span>
                    )}
                    {profile.yearsExp && (
                      <span className="profile-meta-chip"><Briefcase size={12} /> {profile.yearsExp} yrs exp</span>
                    )}
                    {profile.currentRole && (
                      <span className="profile-meta-chip"><Award size={12} /> {profile.currentRole}{profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}</span>
                    )}
                    {profile.companySize && (
                      <span className="profile-meta-chip">👥 {profile.companySize}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Completion bar (seeker only) */}
              {!isEmployer && (
                <div className="completion-bar-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Profile Strength</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: completion >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{completion}%</span>
                  </div>
                  <div className="completion-bar-bg">
                    <div className="completion-bar-fill" style={{ width: `${completion}%`, background: completion >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
                  </div>
                  {completion < 100 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {completion < 50 ? '🔴 Add more details to attract employers' : '🟡 Almost there! Fill in the remaining fields.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            {(profile.bio || profile.about) && (
              <div className="profile-section-card">
                <h3 className="profile-section-title">About</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>{profile.bio || profile.about}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="profile-section-card">
                <h3 className="profile-section-title">Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profile.skills.map((s) => (
                    <span key={s} className="skill-chip selected">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(profile.linkedin || profile.portfolio || profile.resumeLink || profile.website) && (
              <div className="profile-section-card">
                <h3 className="profile-section-title">Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="profile-link-btn">
                      💼 LinkedIn <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.portfolio && (
                    <a href={profile.portfolio} target="_blank" rel="noreferrer" className="profile-link-btn">
                      🌐 Portfolio / Website <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.resumeLink && (
                    <a href={profile.resumeLink} target="_blank" rel="noreferrer" className="profile-link-btn">
                      📄 Resume / CV <ExternalLink size={12} />
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noreferrer" className="profile-link-btn">
                      🌐 Company Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
