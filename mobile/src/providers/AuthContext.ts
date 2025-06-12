import { createContext, useContext } from 'react';
import { AuthUser } from '../services/firebaseAuthService';

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
