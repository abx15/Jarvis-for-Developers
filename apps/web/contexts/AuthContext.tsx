'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse, LoginData, RegisterData, UserUpdate } from '../lib/api';
import { apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UserUpdate) => Promise<User>;
  refreshUser: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Try to get current user if token exists
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        } else {
          // Clear any stale data
          apiClient.clearTokens();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        apiClient.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.login(data);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.register(data);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, clear local state
      setUser(null);
      apiClient.clearTokens();
    }
  };

  const updateProfile = async (data: UserUpdate): Promise<User> => {
    try {
      const updatedUser = await apiClient.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      apiClient.clearTokens();
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    try {
      const response = await apiClient.getGitHubOAuthUrl();
      
      // Store state in sessionStorage for verification after callback
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('github_oauth_state', response.state);
      }
      
      // Redirect to GitHub OAuth page
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error('GitHub OAuth failed:', error);
      throw error;
    }
  };

  // Handle GitHub OAuth callback
  useEffect(() => {
    const handleGitHubCallback = async () => {
      if (typeof window === 'undefined') return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('github_oauth_state');
      
      if (code && state && storedState === state) {
        setIsLoading(true);
        try {
          const response = await apiClient.handleGitHubCallback({ code, state });
          setUser(response.user);
          
          // Clean up
          sessionStorage.removeItem('github_oauth_state');
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('GitHub callback failed:', error);
          sessionStorage.removeItem('github_oauth_state');
          // Redirect to login with error
          window.location.href = '/login?error=github_failed';
        } finally {
          setIsLoading(false);
        }
      } else if (urlParams.get('error')) {
        // Handle OAuth errors
        sessionStorage.removeItem('github_oauth_state');
        window.location.href = '/login?error=github_cancelled';
      }
    };

    handleGitHubCallback();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    loginWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  return { user, isLoading, isAuthenticated };
}
