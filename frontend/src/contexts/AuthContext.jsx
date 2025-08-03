import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('token');
      const savedUser = Cookies.get('user');
      
      if (token && savedUser && savedUser !== 'undefined') {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally refresh user data from server
          const response = await authAPI.getProfile();
          setUser(response.data.user);
          Cookies.set('user', JSON.stringify(response.data.user), { expires: 30 });
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('user', JSON.stringify(user), { expires: 30 });
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('user', JSON.stringify(user), { expires: 30 });
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const newUserData = typeof userData === 'function' ? userData(user) : userData;
    setUser(newUserData);
    if (newUserData) {
      Cookies.set('user', JSON.stringify(newUserData), { expires: 30 });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
