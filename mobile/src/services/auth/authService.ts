import { Amplify } from 'aws-amplify';
import { 
  signUp, confirmSignUp, resendSignUpCode, signIn, signOut,
  fetchUserAttributes, fetchAuthSession, resetPassword, 
  confirmResetPassword, updatePassword, getCurrentUser,
  signInWithRedirect
} from '@aws-amplify/auth';
import '@aws-amplify/react-native'; // Important: Register React Native adapters
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Linking from 'expo-linking';
import { authStorage } from '../../utils/authStorage';

// Amplify configuration for v6
// Note: In a real app, these values should come from environment variables
// or a configuration file that's not committed to source control
const awsConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-1', // Replace with your AWS region
      userPoolId: 'us-east-2_VJu9ay1fn', // Replace with your Cognito User Pool ID
      userPoolClientId: '3ih6llg6kdoee6rd3u1cune0p3', // Replace with your App Client ID
      oauth: {
        domain: 'your-domain.auth.us-east-1.amazoncognito.com', // Replace with your Cognito domain
        scope: ['email', 'profile', 'openid'],
        redirectSignIn: 'gofer://callback',
        redirectSignOut: 'gofer://signout',
        responseType: 'code',
      }
    }
  }
};

// Initialize Amplify
Amplify.configure(awsConfig);

// Biometric authentication constants
const BIOMETRIC_KEY = '@gofer_app:biometric_enabled';
const BIOMETRIC_USERNAME_KEY = '@gofer_app:biometric_username';

/**
 * Authentication service for managing user authentication with AWS Cognito
 */
export const authService = {
  /**
   * Sign up a new user
   * @param email User's email
   * @param password User's password
   * @param attributes Additional user attributes
   */
  signUp: async (email: string, password: string, attributes: Record<string, string>) => {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...attributes
          }
        }
      });
      return {
        username: email,
        isSignUpComplete: result.isSignUpComplete,
        nextStep: result.nextStep
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  /**
   * Confirm sign up with verification code
   * @param email User's email
   * @param code Verification code sent to email
   */
  confirmSignUp: async (email: string, code: string) => {
    try {
      return await confirmSignUp({
        username: email,
        confirmationCode: code
      });
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  },

  /**
   * Resend confirmation code
   * @param email User's email
   */
  resendConfirmationCode: async (email: string) => {
    try {
      return await resendSignUpCode({
        username: email
      });
    } catch (error) {
      console.error('Error resending code:', error);
      throw error;
    }
  },

  /**
   * Sign in a user
   * @param email User's email
   * @param password User's password
   */
  signIn: async (email: string, password: string) => {
    try {
      const signInResult = await signIn({
        username: email,
        password
      });
      
      // Store auth session if available
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          const idToken = session.tokens.idToken.toString();
          const refreshToken = session.tokens.refreshToken.toString();
          
          // Save tokens for future use
          await authStorage.saveTokens(idToken, refreshToken);
          
          // Get user attributes
          const userAttributes = await fetchUserAttributes();
          
          // Save basic user data
          await authStorage.saveUserData({
            username: email,
            attributes: userAttributes || {},
          });
        }
      } catch (sessionError) {
        console.warn('Could not save auth session:', sessionError);
      }
      
      const currentUser = await getCurrentUser();
      
      return {
        username: email,
        attributes: await fetchUserAttributes(),
        isSignedIn: true,
        signInDetails: signInResult
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await signOut();
      // Clear biometric login info when signing out
      await AsyncStorage.multiRemove([BIOMETRIC_KEY, BIOMETRIC_USERNAME_KEY]);
      // Clear auth tokens and user data
      await authStorage.clearAuthData();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      return {
        username: currentUser.username,
        attributes: userAttributes || {},
      };
    } catch (error) {
      // User is not signed in
      return null;
    }
  },

  /**
   * Get current user's session
   */
  getCurrentSession: async () => {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  /**
   * Forgot password - initiate reset
   * @param email User's email
   */
  forgotPassword: async (email: string) => {
    try {
      return await resetPassword({
        username: email
      });
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  },

  /**
   * Reset password with confirmation code
   * @param email User's email
   * @param code Confirmation code
   * @param newPassword New password
   */
  forgotPasswordSubmit: async (email: string, code: string, newPassword: string) => {
    try {
      return await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Change password for authenticated user
   * @param oldPassword Current password
   * @param newPassword New password
   */
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      return await updatePassword({
        oldPassword,
        newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Check if device supports biometric authentication
   */
  isBiometricAvailable: async () => {
    const available = await LocalAuthentication.hasHardwareAsync();
    const enrolled = available && await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  },

  /**
   * Authenticate user using biometrics
   */
  authenticateWithBiometrics: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with Biometrics',
        fallbackLabel: 'Use password instead',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  /**
   * Enable biometric login for user
   * @param username User's email/username
   */
  enableBiometricLogin: async (username: string) => {
    try {
      await AsyncStorage.multiSet([
        [BIOMETRIC_KEY, 'true'],
        [BIOMETRIC_USERNAME_KEY, username]
      ]);
      return true;
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      return false;
    }
  },

  /**
   * Check if biometric login is enabled
   */
  isBiometricEnabled: async () => {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  },

  /**
   * Get username saved for biometric login
   */
  getBiometricUsername: async () => {
    try {
      return await AsyncStorage.getItem(BIOMETRIC_USERNAME_KEY);
    } catch (error) {
      console.error('Error getting biometric username:', error);
      return null;
    }
  },

  /**
   * Disable biometric login
   */
  disableBiometricLogin: async () => {
    try {
      await AsyncStorage.multiRemove([BIOMETRIC_KEY, BIOMETRIC_USERNAME_KEY]);
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      return false;
    }
  },

  /**
   * Initialize Linking listener for handling OAuth redirects
   */
  initializeAuthLinking: () => {
    Linking.addEventListener('url', async ({ url }) => {
      if (url && url.startsWith('gofer://callback')) {
        try {
          // Handle the redirect URL
          const session = await fetchAuthSession();
          if (session.tokens) {
            const idToken = session.tokens.idToken?.toString();
            // Amplify v6 uses accessToken instead of refreshToken
            const accessToken = session.tokens.accessToken?.toString();
            
            if (idToken && accessToken) {
              // Save tokens for future use
              await authStorage.saveTokens(idToken, accessToken);
              
              // Get user attributes
              const userAttributes = await fetchUserAttributes();
              const user = await getCurrentUser();
              
              // Save basic user data
              await authStorage.saveUserData({
                username: user.username,
                attributes: userAttributes || {},
              });
            }
          }
        } catch (error) {
          console.error('Error handling auth redirect:', error);
        }
      }
    });
  },
  
  /**
   * Sign in with OAuth using hosted UI
   * @param provider The identity provider to use (e.g. 'Google', 'Facebook', 'Apple')
   */
  signInWithOAuth: async (provider?: string) => {
    try {
      // Based on AWS Amplify v6 API
      await signInWithRedirect({
        provider: provider as any // Type assertion needed due to API type constraints
      });
      return true;
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      throw error;
    }
  },
  
  /**
   * Get the initial URL when app is opened from a deep link
   */
  getInitialURL: async () => {
    try {
      return await Linking.getInitialURL();
    } catch (error) {
      console.error('Error getting initial URL:', error);
      return null;
    }
  },
};
