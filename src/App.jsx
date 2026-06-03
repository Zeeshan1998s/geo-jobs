import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MapSearch from './pages/MapSearch';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import ProfileSetup from './pages/ProfileSetup';
import EmployerProfileSetup from './pages/EmployerProfileSetup';
import ProfileView from './pages/ProfileView';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MapSearch />} />
          <Route path="/dashboard" element={<SeekerDashboard />} />
          <Route path="/company-dashboard" element={<EmployerDashboard />} />
          <Route path="/profile/setup" element={<ProfileSetup />} />
          <Route path="/profile/employer-setup" element={<EmployerProfileSetup />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
