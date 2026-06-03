import React from 'react';
import { X, Briefcase, MapPin, DollarSign, Award, ExternalLink, Bookmark, CheckCircle2, Route } from 'lucide-react';

export default function JobDetail({ job, isOpen, onClose, onApply, isSaved, onSaveToggle, onAddToItinerary, isInItinerary }) {
  if (!job) return null;

  const handleDirections = () => {
    if (job.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${job.coordinates.lat},${job.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className={`detail-drawer ${isOpen ? 'open' : ''}`}>
      <div className="detail-header">
        <h3 className="logo-text" style={{ fontSize: '1.2rem' }}>Job Specifications</h3>
        <button className="btn-close" onClick={onClose} aria-label="Close details">
          <X size={16} />
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-company-section">
          <div className="detail-logo">{job.logo || '💼'}</div>
          <div>
            <h4 className="detail-title">{job.title}</h4>
            <div className="detail-company">{job.company}</div>
          </div>
        </div>

        <div className="detail-stats">
          <div className="detail-stat-box">
            <div className="detail-stat-label">Salary</div>
            <div className="detail-stat-val" style={{ color: 'var(--accent-emerald)' }}>{job.salary}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Experience</div>
            <div className="detail-stat-val">{job.experience || 'Not specified'}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Job Type</div>
            <div className="detail-stat-val">{job.type}</div>
          </div>
          <div className="detail-stat-box">
            <div className="detail-stat-label">Industry</div>
            <div className="detail-stat-val">{job.industry}</div>
          </div>
        </div>

        <div className="detail-section-title">
          <MapPin size={16} className="instructions-icon" /> Office Location
        </div>
        <p className="detail-desc" style={{ marginBottom: '10px', fontSize: '0.85rem' }}>
          {job.location}
        </p>

        {job.coordinates && (
          <div style={{ marginTop: '10px', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', height: '200px', border: '1px solid var(--panel-border)', background: 'var(--card-bg)' }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${job.coordinates.lat},${job.coordinates.lng}&layer=c&cbll=${job.coordinates.lat},${job.coordinates.lng}&cbp=11,0,0,0,0&output=svembed`}
              allowFullScreen
              title="Street View"
            ></iframe>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={handleDirections}
            className="clear-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          >
            Get directions <ExternalLink size={12} />
          </button>

          <button
            onClick={() => onAddToItinerary && onAddToItinerary(job)}
            className={`clear-btn ${isInItinerary ? 'itinerary-active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              color: isInItinerary ? 'var(--accent-amber)' : undefined,
              borderColor: isInItinerary ? 'var(--accent-amber)' : undefined,
            }}
            title={isInItinerary ? 'Remove from Interview Route' : 'Add to Interview Route'}
          >
            <Route size={12} />
            {isInItinerary ? '✓ In Route' : '+ Add to Route'}
          </button>
        </div>

        <div className="detail-section-title">
          <Briefcase size={16} className="instructions-icon" /> Role Description
        </div>
        <p className="detail-desc">{job.description}</p>

        {job.requirements && job.requirements.length > 0 && (
          <>
            <div className="detail-section-title">
              <Award size={16} className="instructions-icon" /> Requirements
            </div>
            <ul className="detail-list">
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <>
            <div className="detail-section-title">
              <CheckCircle2 size={16} className="instructions-icon" style={{ color: 'var(--accent-emerald)' }} /> Perks & Benefits
            </div>
            <ul className="detail-list">
              {job.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="detail-footer">
        <button
          className={`btn-bookmark ${isSaved ? 'saved' : ''}`}
          onClick={() => onSaveToggle(job.id)}
          title={isSaved ? "Saved to bookmarks" : "Save job"}
        >
          <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button className="btn-apply" onClick={() => onApply(job)}>
          Apply for Job
        </button>
      </div>
    </div>
  );
}
