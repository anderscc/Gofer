import { Amplify, Auth } from 'aws-amplify';
import { authStorage } from './authStorage';

const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Utility for handling token refresh and expiration
 */
export const tokenManager = {
  /**
   * Check if auth token is expired or will expire soon
   * @param token JWT token
   * @returns boolean indicating if token is expired or will expire soon
   */
  isTokenExpiredOrExpiringSoon: (token: string): boolean => {
    try {
      // Decode JWT token (without verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    
      const { exp } = JSON.parse(jsonPayload);
      
      if (!exp) return true;
      
      // Check if token is expired or will expire soon
      const now = Date.now();
      const expTime = exp * 1000; // Convert to milliseconds
      
      return (expTime - now) < TOKEN_REFRESH_THRESHOLD_MS;
    } catch (e) {
      console.error('Error decoding token:', e);
      return true; // If we can't decode, assume it's expired
    }
  },

  /**
   * Refresh authentication token using refresh token
   * @returns New auth token and refresh token
   */
  refreshToken: async (): Promise<{ authToken: string; refreshToken: string } | null> => {
    try {
      const currentSession = await Auth.currentSession();
      const cognitoUser = await Auth.currentAuthenticatedUser();
      
      return new Promise((resolve, reject) => {
        cognitoUser.refreshSession(
          currentSession.getRefreshToken(),
          (err: any, session: any) => {
            if (err) {
              console.error('Error refreshing token:', err);
              reject(err);
              return;
            }

            const authToken = session.getIdToken().getJwtToken();
            const refreshToken = session.getRefreshToken().getToken();
            
            // Save the new tokens
            authStorage.saveTokens(authToken, refreshToken)
              .then(() => {
                resolve({ authToken, refreshToken });
              })
              .catch(saveErr => {
                console.error('Error saving refreshed tokens:', saveErr);
                reject(saveErr);
              });
          }
        );
      });
    } catch (e) {
      console.error('Could not refresh token:', e);
      return null;
    }
  },

  /**
   * Get valid auth token, refreshing if necessary
   * @returns Valid auth token or null if unable to get one
   */
  getValidAuthToken: async (): Promise<string | null> => {
    try {
      // Try to get token from storage first
      const storedAuthToken = await authStorage.getAuthToken();
      
      if (storedAuthToken && !tokenManager.isTokenExpiredOrExpiringSoon(storedAuthToken)) {
        // Token exists and is not expired
        return storedAuthToken;
      }
      
      // Token doesn't exist or is expired, try to refresh
      const refreshResult = await tokenManager.refreshToken();
      if (refreshResult) {
        return refreshResult.authToken;
      }
      
      // If refresh fails, try to get from current session
      const session = await Auth.currentSession();
      const sessionToken = session.getIdToken().getJwtToken();
      
      if (sessionToken) {
        await authStorage.saveTokens(
          sessionToken, 
          session.getRefreshToken().getToken()
        );
        return sessionToken;
      }
      
      return null;
    } catch (e) {
      console.error('Error getting valid auth token:', e);
      return null;
    }
  }
};
