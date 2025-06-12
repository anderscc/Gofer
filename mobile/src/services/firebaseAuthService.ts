import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USER_TOKEN_KEY = 'firebase_user_token';
const USER_DATA_KEY = 'firebase_user_data';
const REFRESH_TOKEN_KEY = 'firebase_refresh_token';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Firebase Authentication Service
 * Handles all authentication operations with Firebase Auth
 */
export class FirebaseAuthService {
  private authStateCallbacks: ((user: User | null) => void)[] = [];

  constructor() {
    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      this.handleAuthStateChange(user);
    });
  }

  /**
   * Handle authentication state changes
   */
  private async handleAuthStateChange(user: User | null) {
    if (user) {
      // User is signed in, save token securely
      const token = await user.getIdToken();
      await this.saveTokenSecurely(token);
      await this.saveUserData(this.mapFirebaseUser(user));
    } else {
      // User is signed out, clear stored data
      await this.clearStoredData();
    }

    // Notify all listeners
    this.authStateCallbacks.forEach(callback => callback(user));
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateCallbacks = this.authStateCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Sign up a new user
   */
  async signUp({ email, password, firstName, lastName }: SignUpData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with display name
      const displayName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : firstName || email.split('@')[0];
      
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Reload user to get updated profile
      await reload(user);

      return this.mapFirebaseUser(user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await this.clearStoredData();
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get current user auth data
   */
  getCurrentAuthUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    try {
      await sendEmailVerification(user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Check if user's email is verified
   */
  async checkEmailVerification(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    await reload(user);
    return user.emailVerified;
  }

  /**
   * Get stored auth token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(USER_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUserData(): Promise<AuthUser | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Save token securely
   */
  private async saveTokenSecurely(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  /**
   * Save user data
   */
  private async saveUserData(userData: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Clear all stored data
   */
  private async clearStoredData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  }

  /**
   * Map Firebase User to AuthUser
   */
  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
    };
  }

  /**
   * Handle Firebase auth errors
   */
  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection';
          break;
        case 'auth/requires-recent-login':
          message = 'Please sign in again to perform this action';
          break;
        default:
          message = error.message || message;
      }
    }

    return new Error(message);
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
