import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from './authService';
import type { AuthUser, SignUpInput, SignInInput } from './types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometrics: (enable: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const auth = AuthService.getInstance();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        // Try biometric login first
        const biometricUser = await auth.signInWithBiometrics();
        if (biometricUser) {
          setUser(biometricUser);
          return;
        }

        // TODO: Implement session persistence
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleError = (err: any) => {
    setError(err instanceof Error ? err : new Error(err.message || 'An error occurred'));
    throw err;
  };

  const signUp = async (input: SignUpInput) => {
    try {
      setError(null);
      setIsLoading(true);
      await auth.signUp(input);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (input: SignInInput) => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await auth.signIn(input);
      setUser(user);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await auth.signInWithGoogle();
      setUser(user);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await auth.signInWithApple();
      setUser(user);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithBiometrics = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const user = await auth.signInWithBiometrics();
      if (user) {
        setUser(user);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await auth.signOut();
      setUser(null);
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const enableBiometrics = async (enable: boolean) => {
    try {
      return await auth.enableBiometricLogin(enable);
    } catch (err: any) {
      handleError(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signInWithBiometrics,
        signOut,
        enableBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
