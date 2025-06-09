import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const BIOMETRIC_KEY = '@gofer_app:biometric_enabled';
const BIOMETRIC_USERNAME_KEY = '@gofer_app:biometric_username';

/**
 * Utility functions for handling biometric authentication
 */
export const biometricUtils = {
  /**
   * Check if device supports biometric authentication 
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return hardware && enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  /**
   * Get types of biometric supported by device
   */
  getSupportedBiometricTypes: async (): Promise<string[]> => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const typeNames = types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });
      return typeNames;
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  },

  /**
   * Get appropriate biometric name (Face ID, Touch ID, etc.) for UI
   */
  getBiometricName: async (): Promise<string> => {
    try {
      const types = await biometricUtils.getSupportedBiometricTypes();
      if (types.includes('Face ID')) return 'Face ID';
      if (types.includes('Fingerprint')) return 'Fingerprint';
      return 'Biometric';
    } catch (error) {
      console.error('Error getting biometric name:', error);
      return 'Biometric';
    }
  },

  /**
   * Authenticate user using biometrics
   * @param promptMessage Message to display to the user
   */
  authenticate: async (promptMessage: string = 'Authenticate to continue'): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
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
  enableBiometricLogin: async (username: string): Promise<boolean> => {
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
  isBiometricEnabled: async (): Promise<boolean> => {
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
  getBiometricUsername: async (): Promise<string | null> => {
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
  disableBiometricLogin: async (): Promise<boolean> => {
    try {
      await AsyncStorage.multiRemove([BIOMETRIC_KEY, BIOMETRIC_USERNAME_KEY]);
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      return false;
    }
  }
};
