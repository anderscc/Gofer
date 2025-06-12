import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { firebaseAuthService, AuthUser } from '../services/firebaseAuthService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = firebaseAuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated
        const authUser = firebaseAuthService.getCurrentAuthUser();
        setUser(authUser);
      } else {
        // User is not authenticated
        setUser(null);
      }
      setIsLoading(false);
    });

    // Check for stored user data on app launch
    const checkStoredAuth = async () => {
      try {
        const currentUser = firebaseAuthService.getCurrentUser();
        if (currentUser) {
          const authUser = firebaseAuthService.getCurrentAuthUser();
          setUser(authUser);
        }
      } catch (err) {
        console.error('Error checking stored auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const authUser = await firebaseAuthService.signUp({
        email,
        password,
        firstName,
        lastName,
      });
      setUser(authUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const authUser = await firebaseAuthService.signIn(email, password);
      setUser(authUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.resetPassword(email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailVerification = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.resendEmailVerification();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    try {
      return await firebaseAuthService.checkEmailVerification();
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendEmailVerification,
    checkEmailVerification,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
