import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.verifyToken();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    if (!token) {
      throw new Error('Token is required for login');
    }
    localStorage.setItem('token', token);
    try {
      const response = await authAPI.verifyToken();
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
