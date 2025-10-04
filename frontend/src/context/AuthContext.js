import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authService.getProfile();
          // Standardize user ID to 'id'
          setUser({ ...userData, id: userData._id, role: userData.role });
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to load user from token:', error.response?.data?.message || error.message || error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = (userData, newToken) => {
    // Standardize user ID to 'id'
    const standardizedUser = { ...userData, id: userData._id || userData.id, role: userData.role };
    setUser(standardizedUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};