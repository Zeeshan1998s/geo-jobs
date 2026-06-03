import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SKILLS_LIST, AVATAR_OPTIONS, YEARS_EXP_OPTIONS } from '../data/profileStorage';
import { ChevronRight, ChevronLeft, Check, X, User } from 'lucide-react';

const TOTAL_STEPS = 4;

export default function ProfileSetup() {
  const { user, saveProfile, profile: existingProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: existingProfile?.name || user?.name || '',
    headline: existingProfile?.headline || '',
    avatar: existingProfile?.avatar || '👨‍💻',
    location: existingProfile?.location || '',
    currentRole: existingProfile?.currentRole || '',
    currentCompany: existingProfile?.currentCompany || '',
    yearsExp: existingProfile?.yearsExp || '1-3',
    bio: existingProfile?.bio || '',
    skills: existingProfile?.skills || [],
    customSkill: '',
    linkedin: existingProfile?.linkedin || '',
    portfolio: existingProfile?.portfolio || '',
    resumeLink: existingProfile?.resumeLink || '',
  });

  if (!user || user.role !== 'seeker') {
    navigate('/');
    return null;
  }

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const s = form.customSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s], customSkill: '' }));
    }
  };

  const handleFinish = () => {
    const { customSkill, ...data } = form;
    saveProfile(data);
    navigate('/dashboard');
  };

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="setup-page">
      {/* Header */}
      <div className="setup-header">
        <div className="logo-text" style={{ fontSize: '1.4rem' }}>🌐 GeoJobs</div>
        <button className="clear-btn" onClick={() => navigate('/')}>Skip for now</button>
      </div>

      {/* Progress bar */}
      <div className="setup-progress-bar">
        <div className="setup-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="setup-container">
        <div className="setup-step-label">Step {step} of {TOTAL_STEPS}</div>

        {/* ── Step 1: Identity ── */}
        {step === 1 && (
          <div className="setup-card">
            <h1 className="setup-title">Who are you? 👋</h1>
            <p className="setup-subtitle">Help companies know who they're talking to.</p>

            {/* Avatar picker */}
            <div className="form-group">
              <label>Choose your avatar</label>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`avatar-option ${form.avatar === emoji ? 'selected' : ''}`}
                    onClick={() => update('avatar', emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Zeeshan Ahmed"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Professional Headline *</label>
              <input
                className="form-input"
                placeholder="e.g. Senior React Developer • Open to Remote"
                value={form.headline}
                onChange={(e) => update('headline', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>City / Location</label>
              <input
                className="form-input"
                placeholder="e.g. Hyderabad, India"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Experience ── */}
        {step === 2 && (
          <div className="setup-card">
            <h1 className="setup-title">Your Experience 💼</h1>
            <p className="setup-subtitle">Tell employers about your background.</p>

            <div className="form-group">
              <label>Current / Most Recent Job Title</label>
              <input
                className="form-input"
                placeholder="e.g. Frontend Engineer"
                value={form.currentRole}
                onChange={(e) => update('currentRole', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Current / Most Recent Company</label>
              <input
                className="form-input"
                placeholder="e.g. Google or Freelancer"
                value={form.currentCompany}
                onChange={(e) => update('currentCompany', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Years of Experience</label>
              <select
                className="form-input"
                value={form.yearsExp}
                onChange={(e) => update('yearsExp', e.target.value)}
              >
                {YEARS_EXP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Short Bio <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(max 280 chars)</span></label>
              <textarea
                className="form-input"
                style={{ height: '100px', resize: 'vertical' }}
                placeholder="Tell employers what makes you unique. What are you passionate about? What kind of work excites you?"
                value={form.bio}
                maxLength={280}
                onChange={(e) => update('bio', e.target.value)}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {form.bio.length}/280
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Skills ── */}
        {step === 3 && (
          <div className="setup-card">
            <h1 className="setup-title">Your Skills 🛠️</h1>
            <p className="setup-subtitle">Select all that apply — we'll use these to match you to jobs.</p>

            {/* Selected chips */}
            {form.skills.length > 0 && (
              <div className="skill-chips-selected">
                {form.skills.map((skill) => (
                  <span key={skill} className="skill-chip selected">
                    {skill}
                    <button type="button" className="chip-remove" onClick={() => toggleSkill(skill)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill grid */}
            <div className="skills-grid">
              {SKILLS_LIST.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-btn ${form.skills.includes(skill) ? 'active' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {form.skills.includes(skill) && <Check size={11} />}
                  {skill}
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Add a custom skill</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="form-input"
                  placeholder="e.g. Three.js, Blender…"
                  value={form.customSkill}
                  onChange={(e) => update('customSkill', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                />
                <button type="button" className="btn-submit" style={{ whiteSpace: 'nowrap', padding: '10px 16px' }} onClick={addCustomSkill}>
                  + Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Links ── */}
        {step === 4 && (
          <div className="setup-card">
            <h1 className="setup-title">Resume & Links 🔗</h1>
            <p className="setup-subtitle">Make it easy for employers to learn more. All fields optional.</p>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                className="form-input"
                placeholder="https://linkedin.com/in/your-name"
                value={form.linkedin}
                onChange={(e) => update('linkedin', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Portfolio / Personal Website</label>
              <input
                className="form-input"
                placeholder="https://yoursite.com"
                value={form.portfolio}
                onChange={(e) => update('portfolio', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Resume Link <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Google Drive, Notion, Dropbox…)</span></label>
              <input
                className="form-input"
                placeholder="https://drive.google.com/…"
                value={form.resumeLink}
                onChange={(e) => update('resumeLink', e.target.value)}
              />
            </div>

            {/* Summary preview */}
            <div className="profile-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '2.5rem' }}>{form.avatar}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{form.name || 'Your Name'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-purple)' }}>{form.headline || 'Your Headline'}</div>
                  {form.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {form.location}</div>}
                </div>
              </div>
              {form.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {form.skills.slice(0, 6).map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                  {form.skills.length > 6 && (
                    <span className="skill-chip">+{form.skills.length - 6} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="setup-nav">
          {step > 1 ? (
            <button className="btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button
              className="btn-submit"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && (!form.name.trim() || !form.headline.trim())}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn-submit"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-emerald))' }}
              onClick={handleFinish}
            >
              <Check size={16} /> Save Profile & Start Exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
