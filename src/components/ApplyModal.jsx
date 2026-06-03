import React, { useState } from 'react';
import { X, ExternalLink, Send, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ApplyModal({ job, isOpen, onClose, onSuccess }) {
  const { user, profile, submitApplication } = useAuth();
  const navigate = useNavigate();
  const [coverNote, setCoverNote] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !job) return null;

  const profileComplete = profile && profile.name && profile.headline;

  const handleSubmit = async () => {
    if (!profileComplete) return;
    setSending(true);
    // Simulate a brief async delay for UX polish
    await new Promise((r) => setTimeout(r, 600));
    submitApplication(job, coverNote);
    setSending(false);
    onSuccess && onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container apply-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{job.logo}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>{job.company}</div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-content">
          {!profileComplete ? (
            /* ── Profile incomplete state ── */
            <div className="apply-no-profile">
              <AlertCircle size={40} color="var(--accent-amber)" />
              <h3>Complete your profile first</h3>
              <p>
                Employers need to know who you are. Set up your profile in 2 minutes — it's used for every application you send.
              </p>
              <button
                className="btn-submit"
                style={{ marginTop: '10px' }}
                onClick={() => { onClose(); navigate('/profile/setup'); }}
              >
                Set Up My Profile →
              </button>
            </div>
          ) : (
            /* ── Profile preview + apply ── */
            <>
              <div className="apply-section-label">Applying as</div>
              <div className="apply-profile-card">
                <span className="apply-avatar">{profile.avatar || '👤'}</span>
                <div className="apply-profile-info">
                  <div className="apply-name">{profile.name}</div>
                  <div className="apply-headline">{profile.headline}</div>
                  {profile.currentRole && (
                    <div className="apply-role">{profile.currentRole}{profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}</div>
                  )}
                </div>
              </div>

              {/* Skills preview */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="apply-skills">
                  {profile.skills.slice(0, 6).map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                  {profile.skills.length > 6 && (
                    <span className="skill-chip" style={{ color: 'var(--text-muted)' }}>+{profile.skills.length - 6}</span>
                  )}
                </div>
              )}

              {/* Resume link */}
              {(profile.linkedin || profile.resumeLink || profile.portfolio) && (
                <div className="apply-links">
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="apply-link">
                      💼 LinkedIn <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.resumeLink && (
                    <a href={profile.resumeLink} target="_blank" rel="noreferrer" className="apply-link">
                      📄 Resume <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.portfolio && (
                    <a href={profile.portfolio} target="_blank" rel="noreferrer" className="apply-link">
                      🌐 Portfolio <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}

              {/* Edit profile link */}
              <button
                className="clear-btn"
                style={{ fontSize: '0.75rem', marginBottom: '16px' }}
                onClick={() => { onClose(); navigate('/profile/setup'); }}
              >
                ✏️ Edit my profile
              </button>

              {/* Cover note */}
              <div className="form-group">
                <label style={{ fontSize: '0.82rem' }}>
                  Cover Note <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <textarea
                  className="form-input"
                  style={{ height: '90px', resize: 'vertical', fontSize: '0.85rem' }}
                  placeholder={`Tell ${job.company} why you're excited about this role…`}
                  value={coverNote}
                  maxLength={500}
                  onChange={(e) => setCoverNote(e.target.value)}
                />
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {coverNote.length}/500
                </div>
              </div>
            </>
          )}
        </div>

        {profileComplete && (
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="btn-submit"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
              onClick={handleSubmit}
              disabled={sending}
            >
              {sending ? (
                <span className="btn-spinner" />
              ) : (
                <><Send size={15} /> Send Application</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
