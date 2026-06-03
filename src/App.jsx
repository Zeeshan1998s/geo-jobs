import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MapSearch from './pages/MapSearch';
import SeekerDashboard from './pages/SeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MapSearch />} />
          <Route path="/dashboard" element={<SeekerDashboard />} />
          <Route path="/company-dashboard" element={<EmployerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
