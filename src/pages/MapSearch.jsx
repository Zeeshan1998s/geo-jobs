import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, User, CircleDot, Route, X } from 'lucide-react';
import { mockJobs } from '../data/mockJobs';
import JobMap from '../components/JobMap';
import Sidebar from '../components/Sidebar';
import JobDetail from '../components/JobDetail';
import AddJobModal from '../components/AddJobModal';
import AuthModal from '../components/AuthModal';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MapSearch() {
  // ── Custom Jobs (localStorage) ─────────────────────────────────────────────
  const [customJobs, setCustomJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_custom');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const allJobs = useMemo(() => [...mockJobs, ...customJobs], [customJobs]);

  // ── Map Control ────────────────────────────────────────────────────────────
  const [centerTo, setCenterTo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  // ── Search & Filter ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Panels ─────────────────────────────────────────────────────────────────
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isLightMode, setIsLightMode] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { user, logout, appliedJobIds } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyTargetJob, setApplyTargetJob] = useState(null);

  // ── Phase 4: Advanced Map Modes ────────────────────────────────────────────
  const [isNomadMode, setIsNomadMode] = useState(false);     // Remote heatmap
  const [isCommuteMode, setIsCommuteMode] = useState(false); // Commute radius circle
  const [commuteRadiusKm, setCommuteRadiusKm] = useState(5); // Default 5km
  const [itineraryJobs, setItineraryJobs] = useState([]);    // Multi-interview route

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);

  useEffect(() => {
    localStorage.setItem('geojobs_saved', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('geojobs_custom', JSON.stringify(customJobs));
  }, [customJobs]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || job.industry === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allJobs, searchQuery, activeCategory]);

  // Commute-radius filtered jobs (when commute mode active)
  const visibleJobs = useMemo(() => {
    let base = filteredJobs;

    if (isCommuteMode && userLocation) {
      const R = 6371; // Earth radius km
      base = base.filter((job) => {
        const dLat = (job.coordinates.lat - userLocation.lat) * Math.PI / 180;
        const dLng = (job.coordinates.lng - userLocation.lng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(userLocation.lat * Math.PI / 180) *
          Math.cos(job.coordinates.lat * Math.PI / 180) *
          Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return dist <= commuteRadiusKm;
      });
    } else if (mapBounds) {
      const { southWest, northEast } = mapBounds;
      base = base.filter((job) => {
        const { lat, lng } = job.coordinates;
        return lat >= southWest.lat && lat <= northEast.lat && lng >= southWest.lng && lng <= northEast.lng;
      });
    }

    return base;
  }, [filteredJobs, mapBounds, isCommuteMode, userLocation, commuteRadiusKm]);

  // ── Event Handlers ─────────────────────────────────────────────────────────
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
    setCenterTo({ lat: job.coordinates.lat, lng: job.coordinates.lng, zoom: 15 });
  };

  const handleMapDoubleClick = (coords) => {
    setClickedCoords(coords);
    setIsAddModalOpen(true);
  };

  const handlePostJobBtnClick = () => {
    if (mapBounds) {
      const center = {
        lat: (mapBounds.southWest.lat + mapBounds.northEast.lat) / 2,
        lng: (mapBounds.southWest.lng + mapBounds.northEast.lng) / 2
      };
      setClickedCoords(center);
    } else {
      setClickedCoords(userLocation || { lat: 17.44829, lng: 78.39148 });
    }
    setIsAddModalOpen(true);
  };

  const handleAddJob = (newJob) => {
    setCustomJobs((prev) => [newJob, ...prev]);
    triggerToast(`🚀 Pin added: "${newJob.title}" published successfully!`);
    setTimeout(() => handleSelectJob(newJob), 300);
  };

  const handleSaveToggle = (jobId) => {
    let saved = false;
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) return prev.filter((id) => id !== jobId);
      saved = true;
      return [...prev, jobId];
    });
    triggerToast(saved ? "⭐ Added to saved bookmarks!" : "Removed from bookmarks.");
  };

  const handleApply = (job) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setApplyTargetJob(job);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    triggerToast(`🎉 Application sent to ${applyTargetJob?.company}!`);
  };

  const handleAuthNav = () => {
    if (user) {
      navigate(user.role === 'employer' ? '/company-dashboard' : '/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  // ── Itinerary Handlers ─────────────────────────────────────────────────────
  const handleAddToItinerary = (job) => {
    setItineraryJobs((prev) => {
      const exists = prev.some(j => j.id === job.id);
      if (exists) {
        triggerToast(`🗺️ Removed "${job.title}" from interview route.`);
        return prev.filter(j => j.id !== job.id);
      }
      triggerToast(`🗺️ Added "${job.title}" to your interview route!`);
      return [...prev, job];
    });
  };

  const clearItinerary = () => {
    setItineraryJobs([]);
    triggerToast('Interview route cleared.');
  };

  // ── Commute Mode Toggle ────────────────────────────────────────────────────
  const handleCommuteToggle = () => {
    if (!userLocation && !isCommuteMode) {
      triggerToast('📍 Enable location access to use Commute Radius.');
      return;
    }
    setIsCommuteMode(prev => !prev);
  };

  return (
    <div className="app-container">
      {/* Map Engine */}
      <JobMap
        jobs={filteredJobs}
        selectedJob={selectedJob}
        onSelectJob={handleSelectJob}
        onBoundsChange={setMapBounds}
        onMapDoubleClick={handleMapDoubleClick}
        centerTo={centerTo}
        setCenterTo={setCenterTo}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        isLightMode={isLightMode}
        isNomadMode={isNomadMode}
        isCommuteMode={isCommuteMode}
        commuteRadiusKm={commuteRadiusKm}
        itineraryJobs={itineraryJobs}
      />

      {/* ── Floating Top Dashboard Header ── */}
      <header className="map-header-overlay">
        <div className="stats-container">
          <span className="stat-item">
            <span className="stat-count">{allJobs.length}</span> Total Jobs
          </span>
          <span className="stat-item">
            <span className="stat-count">{visibleJobs.length}</span>
            {isCommuteMode ? ` Within ${commuteRadiusKm}km` : ' In Viewport'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Nomad Mode Toggle */}
          <button
            className={`btn-post-job map-mode-btn ${isNomadMode ? 'mode-active' : ''}`}
            onClick={() => setIsNomadMode(prev => !prev)}
            title="Remote Nomad Heatmap Mode"
          >
            🌍 {isNomadMode ? 'Exit Nomad' : 'Nomad Mode'}
          </button>

          {/* Commute Radius Toggle */}
          <button
            className={`btn-post-job map-mode-btn ${isCommuteMode ? 'mode-active' : ''}`}
            onClick={handleCommuteToggle}
            title="Commute Radius Filter"
          >
            <CircleDot size={14} />
            {isCommuteMode ? `${commuteRadiusKm}km Zone ✓` : 'Commute Zone'}
          </button>

          {/* Commute radius slider (visible only in commute mode) */}
          {isCommuteMode && (
            <div className="radius-slider-wrap">
              <input
                type="range"
                min={1}
                max={50}
                value={commuteRadiusKm}
                onChange={e => setCommuteRadiusKm(Number(e.target.value))}
                className="radius-slider"
                title={`Radius: ${commuteRadiusKm}km`}
              />
            </div>
          )}

          {/* Light/Dark toggle */}
          <button
            className="btn-post-job"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', boxShadow: 'none' }}
            onClick={() => setIsLightMode(!isLightMode)}
            title="Toggle Light/Dark Mode"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Auth / Dashboard button */}
          <button
            className="btn-post-job"
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
            onClick={handleAuthNav}
          >
            {user ? (
              <><span style={{ fontSize: '1.1rem' }}>{user.avatar}</span> Dashboard</>
            ) : (
              <><User size={16} /> Sign In</>
            )}
          </button>

          {user?.role === 'employer' && (
            <button className="btn-post-job" onClick={handlePostJobBtnClick}>
              + Post a Job
            </button>
          )}
        </div>
      </header>

      {/* ── Itinerary Panel (floats bottom-center) ── */}
      {itineraryJobs.length > 0 && (
        <div className="itinerary-panel">
          <div className="itinerary-header">
            <Route size={16} />
            <span>Interview Route ({itineraryJobs.length} stops)</span>
            <button className="btn-close" onClick={clearItinerary} style={{ marginLeft: 'auto' }}>
              <X size={14} />
            </button>
          </div>
          <div className="itinerary-stops">
            {itineraryJobs.map((job, i) => (
              <div key={job.id} className="itinerary-stop" onClick={() => handleSelectJob(job)}>
                <span className="stop-number">{i + 1}</span>
                <div className="stop-info">
                  <span className="stop-title">{job.title}</span>
                  <span className="stop-company">{job.company}</span>
                </div>
                <button
                  className="stop-remove"
                  onClick={(e) => { e.stopPropagation(); handleAddToItinerary(job); }}
                  title="Remove from route"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Left Sidebar ── */}
      <Sidebar
        visibleJobs={visibleJobs}
        totalJobsCount={filteredJobs.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedJobId={selectedJob ? selectedJob.id : null}
        onSelectJob={handleSelectJob}
        onResetFilters={handleResetFilters}
      />

      {/* ── Instructions Bar ── */}
      <div className="instructions-overlay">
        <span className="instructions-icon">💡</span>
        <span>Double-click anywhere on the map to pin a new job at that exact building!</span>
      </div>

      {/* ── Job Detail Drawer ── */}
      <JobDetail
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedJob(null); }}
        onApply={handleApply}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onSaveToggle={handleSaveToggle}
        onAddToItinerary={handleAddToItinerary}
        isInItinerary={selectedJob ? itineraryJobs.some(j => j.id === selectedJob.id) : false}
        isApplied={selectedJob ? appliedJobIds.includes(selectedJob.id) : false}
      />

      {/* One-Click Apply Modal */}
      <ApplyModal
        job={applyTargetJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={handleApplySuccess}
      />

      {/* ── Add Job Modal ── */}
      {isAddModalOpen && (
        <AddJobModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          coordinates={clickedCoords}
          onAddJob={handleAddJob}
        />
      )}

      {/* ── Auth Modal ── */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* ── Toast Notification ── */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
