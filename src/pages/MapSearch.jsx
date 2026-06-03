import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { mockJobs } from '../data/mockJobs';
import JobMap from '../components/JobMap';
import Sidebar from '../components/Sidebar';
import JobDetail from '../components/JobDetail';
import AddJobModal from '../components/AddJobModal';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MapSearch() {
  // Load custom jobs from local storage
  const [customJobs, setCustomJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_custom');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse custom jobs from localStorage:', e);
      return [];
    }
  });

  // Combine mock data and custom pins
  const allJobs = useMemo(() => {
    return [...mockJobs, ...customJobs];
  }, [customJobs]);

  // Map coordinate center tracking
  const [centerTo, setCenterTo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Interactive panels/drawers
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // Saved/Bookmarked jobs
  const [savedJobIds, setSavedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Theme state
  const [isLightMode, setIsLightMode] = useState(false);

  // Auth Context
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLightMode);
  }, [isLightMode]);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('geojobs_saved', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  // Sync custom jobs to localStorage
  useEffect(() => {
    localStorage.setItem('geojobs_custom', JSON.stringify(customJobs));
  }, [customJobs]);

  // Toast trigger helper
  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Filter jobs based on search query & industry category
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'All' || job.industry === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allJobs, searchQuery, activeCategory]);

  // Filter jobs based on active Map Viewport boundaries
  const visibleJobs = useMemo(() => {
    if (!mapBounds) return filteredJobs;
    
    const { southWest, northEast } = mapBounds;
    
    return filteredJobs.filter((job) => {
      const { lat, lng } = job.coordinates;
      return (
        lat >= southWest.lat &&
        lat <= northEast.lat &&
        lng >= southWest.lng &&
        lng <= northEast.lng
      );
    });
  }, [filteredJobs, mapBounds]);

  // Select job card -> Pan map and slide open details panel
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
    
    // Pan map to job coordinates
    setCenterTo({ lat: job.coordinates.lat, lng: job.coordinates.lng, zoom: 15 });
  };

  // double click map to open add job modal
  const handleMapDoubleClick = (coords) => {
    setClickedCoords(coords);
    setIsAddModalOpen(true);
  };

  // Click standard post button -> Default to map center
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

  // Handle new job submission
  const handleAddJob = (newJob) => {
    setCustomJobs((prev) => [newJob, ...prev]);
    triggerToast(`🚀 Pin added: "${newJob.title}" published successfully!`);
    
    // Auto-select the newly added job
    setTimeout(() => {
      handleSelectJob(newJob);
    }, 300);
  };

  // Handle bookmarking
  const handleSaveToggle = (jobId) => {
    let saved = false;
    setSavedJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      } else {
        saved = true;
        return [...prev, jobId];
      }
    });

    triggerToast(saved ? "⭐ Added to saved bookmarks!" : "Removed from bookmarks.");
  };

  // Handle job application submission
  const handleApply = (job) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    triggerToast(`📨 Application sent to ${job.company} for "${job.title}"!`);
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

  return (
    <div className="app-container">
      {/* Map Engine (Leaflet integration) */}
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
      />

      {/* Floating Top Dashboard Header */}
      <header className="map-header-overlay">
        <div className="stats-container">
          <span className="stat-item">
            <span className="stat-count">{allJobs.length}</span> Total Jobs
          </span>
          <span className="stat-item">
            <span className="stat-count">{visibleJobs.length}</span> In Viewport
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-post-job" 
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', boxShadow: 'none' }}
            onClick={() => setIsLightMode(!isLightMode)}
            title="Toggle Light/Dark Mode"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <button 
            className="btn-post-job" 
            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
            onClick={handleAuthNav}
          >
            {user ? (
              <><span style={{fontSize:'1.1rem'}}>{user.avatar}</span> Dashboard</>
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

      {/* Left Glassmorphic Navigation & Listings Sidebar */}
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

      {/* Map Double-Click Usage Help Bar */}
      <div className="instructions-overlay">
        <span className="instructions-icon">💡</span>
        <span>Double-click anywhere on the map to pin a new job at that exact building!</span>
      </div>

      {/* Right Drawer Slide Details View */}
      <JobDetail
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedJob(null);
        }}
        onApply={handleApply}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onSaveToggle={handleSaveToggle}
      />

      {/* Custom Job Creation Modal Popup */}
      {isAddModalOpen && (
        <AddJobModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          coordinates={clickedCoords}
          onAddJob={handleAddJob}
        />
      )}

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Custom Popup Toast Alert */}
      <div className={`toast-notification ${showToast ? 'show' : ''}`}>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
