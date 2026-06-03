import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COMPANY_AVATAR_OPTIONS, COMPANY_SIZE_OPTIONS } from '../data/profileStorage';
import { Check } from 'lucide-react';

const INDUSTRY_OPTIONS = ['Tech', 'Design', 'Marketing', 'Operations', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Media', 'Consulting'];

export default function EmployerProfileSetup() {
  const { user, saveEmployerProfile, profile: existingProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: existingProfile?.companyName || user?.name || '',
    tagline: existingProfile?.tagline || '',
    website: existingProfile?.website || '',
    companySize: existingProfile?.companySize || '11 – 50 (Small)',
    industry: existingProfile?.industry || 'Tech',
    hqCity: existingProfile?.hqCity || '',
    about: existingProfile?.about || '',
    avatar: existingProfile?.avatar || '🏢',
  });

  if (!user || user.role !== 'employer') {
    navigate('/');
    return null;
  }

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveEmployerProfile(form);
    navigate('/company-dashboard');
  };

  return (
    <div className="setup-page">
      <div className="setup-header">
        <div className="logo-text" style={{ fontSize: '1.4rem' }}>🌐 GeoJobs</div>
        <button className="clear-btn" onClick={() => navigate('/company-dashboard')}>Skip for now</button>
      </div>

      <div className="setup-progress-bar">
        <div className="setup-progress-fill" style={{ width: '100%' }} />
      </div>

      <div className="setup-container">
        <div className="setup-step-label">Company Profile</div>

        <div className="setup-card">
          <h1 className="setup-title">Tell us about your company 🏢</h1>
          <p className="setup-subtitle">Help job seekers find and trust your organisation.</p>

          {/* Logo emoji picker */}
          <div className="form-group">
            <label>Company Logo (choose an icon)</label>
            <div className="avatar-grid">
              {COMPANY_AVATAR_OPTIONS.map((emoji) => (
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
            <label>Company Name *</label>
            <input className="form-input" placeholder="e.g. Acme Technologies" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Tagline / One-liner</label>
            <input className="form-input" placeholder="e.g. Building the future of remote work" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Industry</label>
              <select className="form-input" value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select className="form-input" value={form.companySize} onChange={(e) => update('companySize', e.target.value)}>
                {COMPANY_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>HQ City / Location</label>
            <input className="form-input" placeholder="e.g. Hyderabad, India" value={form.hqCity} onChange={(e) => update('hqCity', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input className="form-input" placeholder="https://yourcompany.com" value={form.website} onChange={(e) => update('website', e.target.value)} />
          </div>

          <div className="form-group">
            <label>About Us <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(max 500 chars)</span></label>
            <textarea
              className="form-input"
              style={{ height: '110px', resize: 'vertical' }}
              placeholder="Describe your company culture, mission, and what makes you a great place to work…"
              value={form.about}
              maxLength={500}
              onChange={(e) => update('about', e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.about.length}/500</div>
          </div>

          {/* Preview card */}
          <div className="profile-preview-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>{form.avatar}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{form.companyName || 'Company Name'}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>{form.tagline || 'Your Tagline'}</div>
                {form.hqCity && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {form.hqCity} • {form.companySize}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="setup-nav" style={{ justifyContent: 'flex-end' }}>
          <button
            className="btn-submit"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, var(--accent-emerald), #059669)' }}
            disabled={!form.companyName.trim()}
            onClick={handleSave}
          >
            <Check size={16} /> Save & Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
