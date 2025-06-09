import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../services/auth/authStore';
import { biometricUtils } from '../utils/biometricUtils';
import LoadingIndicator from '../components/ui/LoadingIndicator';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  error: string | null;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, attributes: Record<string, string>) => Promise<any>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<any>;
  toggleBiometricLogin: (enable: boolean, username?: string) => Promise<boolean>;
  setError: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  const {
    isAuthenticated,
    user,
    isLoading,
    isBiometricAvailable,
    isBiometricEnabled,
    checkAuth,
    login,
    loginWithBiometrics,
    logout,
    signUp,
    confirmSignUp,
    resetPassword,
    confirmResetPassword,
    toggleBiometricLogin,
  } = authStore;

  useEffect(() => {
    // Initialize auth state when app loads
    checkAuth();
  }, [checkAuth]);

  // Check for and prompt biometric login if available and enabled
  useEffect(() => {
    const attemptBiometricLogin = async () => {
      if (!isAuthenticated && !isLoading) {
        const biometricAvailable = await biometricUtils.isBiometricAvailable();
        const biometricEnabled = await biometricUtils.isBiometricEnabled();
        
        if (biometricAvailable && biometricEnabled) {
          // Show biometric prompt automatically on app launch
          loginWithBiometrics();
        }
      }
    };

    attemptBiometricLogin();
  }, [isAuthenticated, isLoading, loginWithBiometrics]);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    error: authStore.error,
    isBiometricAvailable,
    isBiometricEnabled,
    login,
    loginWithBiometrics,
    logout,
    signUp,
    confirmSignUp,
    resetPassword,
    confirmResetPassword,
    toggleBiometricLogin,
    setError: authStore.setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoadingIndicator visible={isLoading} message="Please wait..." />
    </AuthContext.Provider>
  );
};

export default AuthProvider;
