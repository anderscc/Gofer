import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@gofer_app:auth_token';
const REFRESH_TOKEN_KEY = '@gofer_app:refresh_token';
const USER_DATA_KEY = '@gofer_app:user_data';

/**
 * Auth storage utility for handling token persistence
 */
export const authStorage = {
  /**
   * Save auth tokens to secure storage
   * @param authToken JWT auth token
   * @param refreshToken Refresh token
   */
  saveTokens: async (authToken: string, refreshToken: string): Promise<void> => {
    try {
      const tokens = [
        [AUTH_TOKEN_KEY, authToken],
        [REFRESH_TOKEN_KEY, refreshToken]
      ];
      await AsyncStorage.multiSet(tokens);
    } catch (error) {
      console.error('Error saving auth tokens:', error);
      throw error;
    }
  },

  /**
   * Get auth token from storage
   */
  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Get refresh token from storage
   */
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Save user data to storage
   * @param userData User data object
   */
  saveUserData: async (userData: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  /**
   * Get user data from storage
   */
  getUserData: async (): Promise<any | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  /**
   * Clear all auth related data from storage
   */
  clearAuthData: async (): Promise<void> => {
    try {
      const keys = [AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }
};
