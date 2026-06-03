import React from 'react';
import { Search, Compass, MapPin, Coffee } from 'lucide-react';

export default function Sidebar({
  visibleJobs,
  totalJobsCount,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  selectedJobId,
  onSelectJob,
  onResetFilters
}) {
  const categories = ["All", "Tech", "Design", "Marketing", "Finance", "Operations"];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Compass size={20} color="#fff" />
          </div>
          <span className="logo-text">GeoJobs</span>
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon-svg" />
          <input
            type="text"
            className="search-input"
            placeholder="Search roles, companies, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="jobs-list-container">
        <div className="list-meta">
          <span>
            Showing <strong>{visibleJobs.length}</strong> jobs here
          </span>
          {(searchQuery || activeCategory !== "All") && (
            <button className="clear-btn" onClick={onResetFilters}>
              Reset filters
            </button>
          )}
        </div>

        {visibleJobs.length === 0 ? (
          <div className="no-jobs">
            <p style={{ marginBottom: '10px' }}>No jobs found in this viewport area.</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Try zooming out, panning the map, or refining your filters.
            </p>
          </div>
        ) : (
          visibleJobs.map((job) => (
            <article
              key={job.id}
              className={`job-card ${selectedJobId === job.id ? 'selected' : ''}`}
              onClick={() => onSelectJob(job)}
            >
              <div className="card-header">
                <span className="company-logo-badge">{job.logo || '💼'}</span>
                <span className="job-time">{job.postedDate}</span>
              </div>
              <h4 className="job-title">{job.title}</h4>
              <div className="company-name">{job.company}</div>
              
              <div className="job-tags">
                <span className="job-tag">{job.type}</span>
                <span className="job-tag">{job.experience}</span>
                <span className="job-tag">{job.industry}</span>
              </div>

              <div className="card-footer">
                <span className="job-salary">{job.salary}</span>
                <span className="job-loc" title={job.location}>
                  <MapPin size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                  {job.location.split(',')[0]}
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      <div style={{ padding: '15px 20px', borderTop: '1px solid var(--panel-border)', background: 'var(--panel-bg)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <a 
          href="https://buymeacoffee.com" 
          target="_blank" 
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #FFDD00, #FBB034)',
            color: '#000',
            textDecoration: 'none',
            padding: '10px 15px',
            borderRadius: '8px',
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 4px 15px rgba(255, 221, 0, 0.3)',
            transition: 'transform 0.2s ease'
          }}
        >
          <Coffee size={18} /> Buy me a Coffee
        </a>
      </div>
    </aside>
  );
}
