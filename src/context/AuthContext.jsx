import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('geojobs_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('geojobs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('geojobs_user');
    }
  }, [user]);

  // Mock login function simulating backend auth
  const login = (email, password, role) => {
    setUser({
      id: `usr_${Date.now()}`,
      email,
      role: role || 'seeker', // 'seeker' or 'employer'
      name: email.split('@')[0],
      avatar: role === 'employer' ? '🏢' : '👤'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
