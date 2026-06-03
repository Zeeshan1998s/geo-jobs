import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getProfile, saveProfile as persistProfile,
  getEmployerProfile, saveEmployerProfile as persistEmployerProfile,
  getApplicationsBySeeker, saveApplication as persistApplication,
  updateApplicationStatus as persistUpdateStatus,
  getAppliedJobIds,
} from '../data/profileStorage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // ── User session ───────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Profile (seeker or employer) ────────────────────────────────────────
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_user');
      const u = saved ? JSON.parse(saved) : null;
      if (!u) return null;
      return u.role === 'employer' ? getEmployerProfile(u.id) : getProfile(u.id);
    } catch {
      return null;
    }
  });

  // ── Applications (seeker's submitted apps) ──────────────────────────────
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_user');
      const u = saved ? JSON.parse(saved) : null;
      if (!u || u.role !== 'seeker') return [];
      return getApplicationsBySeeker(u.id);
    } catch {
      return [];
    }
  });

  // ── Applied job IDs (fast lookup for "✓ Applied" markers) ──────────────
  const [appliedJobIds, setAppliedJobIds] = useState(() => {
    try {
      const saved = localStorage.getItem('geojobs_user');
      const u = saved ? JSON.parse(saved) : null;
      if (!u || u.role !== 'seeker') return [];
      return getAppliedJobIds(u.id);
    } catch {
      return [];
    }
  });

  // ── Persist user session ────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('geojobs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('geojobs_user');
    }
  }, [user]);

  // ── Reload profile whenever user changes ────────────────────────────────
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setApplications([]);
      setAppliedJobIds([]);
      return;
    }
    if (user.role === 'employer') {
      setProfile(getEmployerProfile(user.id));
    } else {
      setProfile(getProfile(user.id));
      const apps = getApplicationsBySeeker(user.id);
      setApplications(apps);
      setAppliedJobIds(apps.map((a) => a.jobId));
    }
  }, [user]);

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback((email, password, role) => {
    // Deterministic user ID from email so same user gets same profile back
    const id = `usr_${btoa(email).replace(/[^a-z0-9]/gi, '').slice(0, 12)}`;
    const newUser = {
      id,
      email,
      role: role || 'seeker',
      name: email.split('@')[0],
      avatar: role === 'employer' ? '🏢' : '👤',
    };
    setUser(newUser);
    return newUser;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    setApplications([]);
    setAppliedJobIds([]);
  }, []);

  // ── Save seeker profile ─────────────────────────────────────────────────
  const saveProfile = useCallback((data) => {
    if (!user) return;
    const saved = persistProfile(user.id, data);
    setProfile(saved);
    // Update user avatar from profile avatar if set
    if (data.avatar) {
      setUser((prev) => ({ ...prev, avatar: data.avatar, name: data.name || prev.name }));
    }
    return saved;
  }, [user]);

  // ── Save employer profile ───────────────────────────────────────────────
  const saveEmployerProfile = useCallback((data) => {
    if (!user) return;
    const saved = persistEmployerProfile(user.id, data);
    setProfile(saved);
    if (data.avatar) {
      setUser((prev) => ({ ...prev, avatar: data.avatar, name: data.companyName || prev.name }));
    }
    return saved;
  }, [user]);

  // ── Submit application ──────────────────────────────────────────────────
  const submitApplication = useCallback((job, coverNote) => {
    if (!user || !profile) return null;
    const app = persistApplication({
      seekerId: user.id,
      seekerName: profile.name || user.name,
      seekerHeadline: profile.headline || '',
      seekerAvatar: profile.avatar || user.avatar,
      seekerSkills: profile.skills || [],
      seekerLinkedin: profile.linkedin || '',
      seekerPortfolio: profile.portfolio || '',
      seekerResume: profile.resumeLink || '',
      jobId: job.id,
      jobTitle: job.title,
      jobCompany: job.company,
      jobLocation: job.location,
      jobLogo: job.logo,
      employerId: job.postedBy || 'mock_employer',
      coverNote: coverNote || '',
    });
    setApplications((prev) => [app, ...prev]);
    setAppliedJobIds((prev) => [...prev, job.id]);
    return app;
  }, [user, profile]);

  // ── Update application status (employer action) ─────────────────────────
  const updateAppStatus = useCallback((appId, status) => {
    const updated = persistUpdateStatus(appId, status);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
    return updated;
  }, []);

  // ── Refresh applications from storage ──────────────────────────────────
  const refreshApplications = useCallback(() => {
    if (!user || user.role !== 'seeker') return;
    const apps = getApplicationsBySeeker(user.id);
    setApplications(apps);
    setAppliedJobIds(apps.map((a) => a.jobId));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      applications,
      appliedJobIds,
      login,
      logout,
      saveProfile,
      saveEmployerProfile,
      submitApplication,
      updateAppStatus,
      refreshApplications,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
