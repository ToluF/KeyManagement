import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for valid token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache' // Add to prevent 304
            }
          });
          
          if (response.ok || response.status === 304) {
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    
    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Login failed');
      }

      // Modify navigation based on role
      let redirectPath = '/dashboard';
      if (data.user.role === 'issuer') {
        redirectPath = '/exchange';
      } else if (data.user.role === 'user') {
        redirectPath = '/dashboard';
      }
      
      // Store both token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate(redirectPath); // Navigate to the desired page
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
         },
        body: JSON.stringify(userData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
  
      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);