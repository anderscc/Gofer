import { create } from 'zustand';
import { authService } from './authService';

// Type definitions
export type User = {
  username: string;
  attributes?: {
    email: string;
    name?: string;
    family_name?: string;
    given_name?: string;
    phone_number?: string;
    [key: string]: any;
  };
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
};

export type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  signUp: (email: string, password: string, attributes: Record<string, string>) => Promise<any>;
  confirmSignUp: (email: string, code: string) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<any>;
  toggleBiometricLogin: (enable: boolean, username?: string) => Promise<boolean>;
  setError: (message: string | null) => void;
};

export type AuthStore = AuthState & AuthActions;

// Create store
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isBiometricAvailable: false,
  isBiometricEnabled: false,

  // Check if the user is already logged in
  checkAuth: async () => {
    try {
      set({ isLoading: true });

      // Check biometric availability
      const isBiometricAvailable = await authService.isBiometricAvailable();
      const isBiometricEnabled = isBiometricAvailable && await authService.isBiometricEnabled();
      
      // Get current user from Cognito
      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        const userData: User = {
          username: currentUser.username,
          attributes: currentUser.attributes || {},
        };

        set({ 
          user: userData, 
          isAuthenticated: true, 
          isLoading: false,
          isBiometricAvailable,
          isBiometricEnabled
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          isBiometricAvailable,
          isBiometricEnabled
        });
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Authentication check failed'
      });
    }
  },

  // Login with email and password
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.signIn(email, password);

      const userData: User = {
        username: user.username,
        attributes: user.attributes || {},
      };

      set({ user: userData, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Login failed. Please check your credentials.'
      });
      throw error;
    }
  },

  // Login with biometrics
  loginWithBiometrics: async () => {
    try {
      set({ isLoading: true, error: null });

      // Check if biometric login is enabled
      const isEnabled = await authService.isBiometricEnabled();
      if (!isEnabled) {
        set({ isLoading: false, error: 'Biometric login not enabled' });
        return false;
      }

      // Get saved username
      const username = await authService.getBiometricUsername();
      if (!username) {
        set({ isLoading: false, error: 'No user saved for biometric login' });
        return false;
      }

      // Authenticate with biometrics
      const success = await authService.authenticateWithBiometrics();
      if (!success) {
        set({ isLoading: false, error: 'Biometric authentication failed' });
        return false;
      }

      // After successful biometric auth, we need to get the actual user
      // In a real implementation, you'd likely store a refresh token securely
      // and use it to get a new session - this is simplified for the example
      const user = await authService.getCurrentUser();
      if (user) {
        const userData: User = {
          username: user.username,
          attributes: user.attributes || {},
        };

        set({ user: userData, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: 'Could not retrieve user after biometric auth'
        });
        return false;
      }
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Biometric login failed.'
      });
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Logout failed.'
      });
    }
  },

  // Sign up
  signUp: async (email, password, attributes) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.signUp(email, password, attributes);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Sign up failed.' 
      });
      throw error;
    }
  },

  // Confirm sign up
  confirmSignUp: async (email, code) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.confirmSignUp(email, code);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Confirmation failed.' 
      });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.forgotPassword(email);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Password reset request failed.' 
      });
      throw error;
    }
  },

  // Confirm reset password
  confirmResetPassword: async (email, code, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.forgotPasswordSubmit(email, code, newPassword);
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Password reset confirmation failed.' 
      });
      throw error;
    }
  },

  // Toggle biometric login
  toggleBiometricLogin: async (enable, username) => {
    try {
      if (enable && username) {
        const success = await authService.enableBiometricLogin(username);
        set({ isBiometricEnabled: success });
        return success;
      } else {
        const success = await authService.disableBiometricLogin();
        set({ isBiometricEnabled: false });
        return success;
      }
    } catch (error) {
      console.error('Error toggling biometric login:', error);
      return false;
    }
  },

  // Set error message
  setError: (message) => {
    set({ error: message });
  }
}));
