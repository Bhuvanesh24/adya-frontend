// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import axios from '@/utils/axiosConfig';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Login successful!",
        });
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed. Please try again.",
        variant: "destructive",
      });
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/signup', { name, email, password });
      if (response.data.message === "Signup successful") {
        toast({
          title: "Success",
          description: "Account created successfully! Please login to continue.",
        });
        return { success: true };
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Signup failed. Please try again.",
        variant: "destructive",
      });
      return { success: false, message: error.response?.data?.message || "Signup failed" };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Logout failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};