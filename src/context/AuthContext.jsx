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
    console.log('Checking auth status...');
    const response = await axios.get('/auth/me');
    console.log('Auth check response:', response.data);

    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Only reset state if explicitly logged out or token is invalid
    if (error.response?.status === 401) {
      setUser(null);
      setIsAuthenticated(false);
    }
  } finally {
    setIsLoading(false);
  }
};

const login = async (email, password) => {
  try {
    setIsLoading(true);
    const response = await axios.post('/auth/login', { email: email.trim(), password });
    if (response.data?.success && response.data?.user) {
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      toast({ title: "Success", description: "Login successful!" });
      return { success: true, user: response.data.user };
    } else {
      throw new Error(response.data?.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Login failed. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, message: errorMessage };
  } finally {
    setIsLoading(false);
  }
};

  // const login = async (email, password) => {
  //   try {
  //     setIsLoading(true);
  //     console.log('Attempting login for:', email);
      
  //     const response = await axios.post('/auth/login', { 
  //       email: email.trim(), 
  //       password 
  //     });
      
  //     console.log('Login response:', response.data);
      
  //     if (response.data?.success && response.data?.user) {
  //       setUser(response.data.user);
  //       setIsAuthenticated(true);
        
  //       // Store token if provided
  //       if (response.data.token) {
  //         localStorage.setItem('authToken', response.data.token);
  //       }
        
  //       toast({
  //         title: "Success",
  //         description: "Login successful!",
  //       });
        
  //       return { success: true, user: response.data.user };
  //     } else {
  //       throw new Error(response.data?.message || 'Login failed');
  //     }
  //   } catch (error) {
  //     console.error('Login error:', error);
      
  //     const errorMessage = error.response?.data?.message || 
  //                         error.message || 
  //                         "Login failed. Please try again.";
      
  //     toast({
  //       title: "Error",
  //       description: errorMessage,
  //       variant: "destructive",
  //     });
      
  //     return { success: false, message: errorMessage };
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const signup = async (name, email, password) => {
    try {
      setIsLoading(true);
      console.log('Attempting signup for:', email);
      
      const response = await axios.post('/auth/signup', { 
        name: name.trim(), 
        email: email.trim(), 
        password 
      });
      
      console.log('Signup response:', response.data);
      
      if (response.data?.success) {
        toast({
          title: "Success",
          description: "Account created successfully! Please login to continue.",
        });
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Signup failed. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      
      // Try to logout from server
      await axios.post('/auth/logout');
      
      console.log('Server logout successful');
    } catch (error) {
      console.error('Server logout error:', error);
      // Continue with local logout even if server logout fails
    } finally {
      // Always clear local auth state
      setUser(null);
      setIsAuthenticated(false);
      // localStorage.removeItem('authToken');
      
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      
      navigate('/login');
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