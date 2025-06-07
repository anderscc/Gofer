import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserAttribute, CognitoUserSession } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as LocalAuthentication from 'expo-local-authentication';
import { GoogleSignin, type GoogleSigninUser } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { AUTH_CONFIG } from './config';
import { SignUpInput, SignInInput, AuthUser, ResetPasswordInput, ConfirmResetPasswordInput, SocialAuthCredentials } from './types';
import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import CryptoJS from 'crypto-js';

// Constants for security
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'gofer-auth-key';
const SALT = CryptoJS.lib.WordArray.random(128 / 8).toString(); // Generate a random salt for each session
const KEY_SIZE = 256 / 32; // for AES-256
const ITERATIONS = 100000; // Increased from 10000 for better security
const TOKEN_REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
const MIN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const SESSION_ENCRYPTION_KEY = CryptoJS.lib.WordArray.random(256 / 8).toString();

// Secure storage keys
const STORAGE_KEYS = {
  USER_CREDENTIALS: 'userCredentials',
  GOOGLE_TOKENS: 'googleTokens',
  APPLE_CREDENTIALS: 'appleCredentials',
  COGNITO_SESSION: 'cognito_session',
  AWS_CREDENTIALS: 'awsCredentials',
  ACCESS_TOKEN: 'accessToken',
  ID_TOKEN: 'idToken',
  REFRESH_TOKEN: 'refreshToken',
  AUTH_ATTEMPTS: 'authAttempts',
  AUTH_LOCKOUT: 'authLockout'
} as const;

const userPool = new CognitoUserPool({
  UserPoolId: AUTH_CONFIG.userPoolId!,
  ClientId: AUTH_CONFIG.userPoolWebClientId!,
  Storage: AsyncStorage as any,
});

const cognitoIdentityClient = new CognitoIdentityClient({
  region: AUTH_CONFIG.region!
});

export class AuthService {
  private static instance: AuthService;
  private biometricEnabled: boolean = false;
  private currentUser: CognitoUser | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private lastTokenRefresh: number = 0;

  private constructor() {
    this.initializeGoogleSignIn();
    this.restoreSession().catch(console.error);
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: AUTH_CONFIG.googleWebClientId,
      iosClientId: AUTH_CONFIG.googleIosClientId,
    });
  }

  async signUp({ email, password, firstName, lastName, phoneNumber }: SignUpInput): Promise<void> {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'given_name', Value: firstName }),
      new CognitoUserAttribute({ Name: 'family_name', Value: lastName }),
      new CognitoUserAttribute({ Name: 'phone_number', Value: phoneNumber }),
      new CognitoUserAttribute({ Name: 'email', Value: email }),
    ];

    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
      Storage: AsyncStorage as any,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async encryptCredentials(data: { email: string; password: string }): Promise<string> {
    try {
      const dataString = JSON.stringify(data);
      
      // Generate a random IV
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      // Derive key using PBKDF2
      const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, SALT, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
      });

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(dataString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV and encrypted data
      const result = {
        iv: iv.toString(),
        data: encrypted.toString()
      };

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  private async decryptCredentials(encrypted: string): Promise<{ email: string; password: string }> {
    try {
      const { iv, data } = JSON.parse(encrypted);

      // Derive the same key
      const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, SALT, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
      });

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error('Failed to decrypt credentials');
      }

      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Invalid credentials format');
    }
  }

  async signIn({ email, password }: SignInInput): Promise<AuthUser> {
    try {
      // Validate network security
      await this.validateNetworkState();

      // Check for auth attempts/lockout
      await this.checkAuthAttempts(email);

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
        Storage: AsyncStorage as any,
      });

      return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: async (session) => {
            try {
              this.currentUser = cognitoUser;
              
              // Store encrypted credentials if biometric auth is enabled
              if (this.biometricEnabled) {
                const encryptedCreds = await this.encryptData(JSON.stringify({ email, password }));
                await AsyncStorage.setItem(STORAGE_KEYS.USER_CREDENTIALS, encryptedCreds);
              }

              // Securely store session
              await this.secureSessionStorage(session);
              
              // Reset failed attempts counter on successful login
              await this.updateAuthAttempts(email, true);
              
              // Start session management
              this.startSessionRefreshTimer();
              
              const user = await this.getUserAttributes(cognitoUser);
              resolve(user);
            } catch (error) {
              console.error('Post-authentication error:', error);
              reject(new Error('Authentication succeeded but session setup failed'));
            }
          },
          onFailure: async (err) => {
            try {
              // Update failed attempts counter
              await this.updateAuthAttempts(email, false);
              reject(err);
            } catch (error) {
              console.error('Auth attempt tracking error:', error);
              reject(err);
            }
          },
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            reject(new Error('Please change your password before logging in'));
          }
        });
      });
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Authentication failed. Please try again.');
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      await GoogleSignin.hasPlayServices();
      const googleSignInResult = await GoogleSignin.signIn();
      const userInfo = await GoogleSignin.getCurrentUser();
      
      if (!googleSignInResult || !userInfo) {
        throw new Error('Failed to get user info from Google Sign In');
      }

      // Get tokens
      const { accessToken, idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign In');
      }

      // Get Cognito Identity ID
      const getIdCommand = new GetIdCommand({
        IdentityPoolId: AUTH_CONFIG.identityPoolId,
        Logins: {
          'accounts.google.com': idToken
        }
      });
      
      const { IdentityId } = await cognitoIdentityClient.send(getIdCommand);
      if (!IdentityId) {
        throw new Error('Failed to get Identity ID from Cognito');
      }

      // Get AWS credentials
      const getCredentialsCommand = new GetCredentialsForIdentityCommand({
        IdentityId,
        Logins: {
          'accounts.google.com': idToken
        }
      });

      const credentials = await cognitoIdentityClient.send(getCredentialsCommand);
      if (!credentials.Credentials) {
        throw new Error('Failed to get AWS credentials');
      }

      // Create an auth user from the Google sign-in response
      const user: AuthUser = {
        id: IdentityId,
        email: userInfo.user.email,
        firstName: userInfo.user.givenName || '',
        lastName: userInfo.user.familyName || '',
        phoneNumber: '',
        emailVerified: true,
        phoneVerified: false,
      };

      // Store social credentials for later use
      const socialCredentials: SocialAuthCredentials = {
        accessToken,
        idToken,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name || null,
          givenName: userInfo.user.givenName || null,
          familyName: userInfo.user.familyName || null,
          photo: userInfo.user.photo || null
        }
      };

      // Encrypt sensitive data before storing
      const encryptedCredentials = await this.encryptData(JSON.stringify(socialCredentials));
      const encryptedAwsCredentials = await this.encryptData(JSON.stringify({
        accessKeyId: credentials.Credentials.AccessKeyId,
        secretAccessKey: credentials.Credentials.SecretKey,
        sessionToken: credentials.Credentials.SessionToken,
        expiration: credentials.Credentials.Expiration,
      }));

      await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_TOKENS, encryptedCredentials);
      await AsyncStorage.setItem(STORAGE_KEYS.AWS_CREDENTIALS, encryptedAwsCredentials);

      this.startSessionRefreshTimer();
      return user;
    } catch (error) {
      console.error('Google Sign In error:', error);
      throw new Error('Google Sign In failed. Please try again.');
    }
  }

  async signInWithApple(): Promise<AuthUser> {
    try {
      const appleAuthAvailable = await appleAuth.isSupported;
      if (!appleAuthAvailable) {
        throw new Error('Apple authentication is not supported on this device');
      }

      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!response.identityToken) {
        throw new Error('Failed to get identity token from Apple Sign In');
      }

      if (!response.authorizationCode) {
        throw new Error('Failed to get authorization code from Apple Sign In');
      }

      // Get Cognito Identity ID
      const getIdCommand = new GetIdCommand({
        IdentityPoolId: AUTH_CONFIG.identityPoolId,
        Logins: {
          'appleid.apple.com': response.identityToken
        }
      });
      
      const { IdentityId } = await cognitoIdentityClient.send(getIdCommand);
      if (!IdentityId) {
        throw new Error('Failed to get Identity ID from Cognito');
      }

      // Get AWS credentials
      const getCredentialsCommand = new GetCredentialsForIdentityCommand({
        IdentityId,
        Logins: {
          'appleid.apple.com': response.identityToken
        }
      });

      const credentials = await cognitoIdentityClient.send(getCredentialsCommand);
      if (!credentials.Credentials) {
        throw new Error('Failed to get AWS credentials');
      }

      // Create a Cognito user with Apple info
      const user: AuthUser = {
        id: IdentityId,
        email: response.email || '',
        firstName: response.fullName?.givenName || '',
        lastName: response.fullName?.familyName || '',
        phoneNumber: '',
        emailVerified: true,
        phoneVerified: false,
      };

      // Store social credentials for later use
      const socialCredentials: SocialAuthCredentials = {
        accessToken: response.authorizationCode,
        idToken: response.identityToken,
        user: {
          id: response.user,
          email: response.email || '',
          name: [response.fullName?.givenName, response.fullName?.familyName].filter(Boolean).join(' ') || null,
          givenName: response.fullName?.givenName || null,
          familyName: response.fullName?.familyName || null,
          photo: null
        }
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APPLE_CREDENTIALS, JSON.stringify(socialCredentials));
      await AsyncStorage.setItem(STORAGE_KEYS.AWS_CREDENTIALS, JSON.stringify({
        accessKeyId: credentials.Credentials.AccessKeyId,
        secretAccessKey: credentials.Credentials.SecretKey,
        sessionToken: credentials.Credentials.SessionToken,
        expiration: credentials.Credentials.Expiration,
      }));

      return user;
    } catch (error) {
      console.error('Apple Sign In error:', error);
      throw error;
    }
  }

  async signInWithBiometrics(): Promise<AuthUser | null> {
    try {
      // Check biometric hardware and enrollment
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) return null;

      // Check network security
      await this.validateNetworkState();

      // Get encrypted credentials
      const encryptedCredentials = await AsyncStorage.getItem(STORAGE_KEYS.USER_CREDENTIALS);
      if (!encryptedCredentials) return null;

      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with biometrics',
        disableDeviceFallback: true,
        fallbackLabel: 'Use password instead'
      });

      if (result.success) {
        try {
          // Decrypt and use credentials
          const decrypted = await this.decryptData(encryptedCredentials);
          const credentials = JSON.parse(decrypted);
          return this.signIn(credentials);
        } catch (error) {
          console.error('Biometric auth error:', error);
          // Remove invalid credentials
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_CREDENTIALS);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Stop session refresh timer
      this.stopSessionRefreshTimer();

      // Clean up Google sign-in
      try {
        const googleTokens = await AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_TOKENS);
        if (googleTokens) {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.warn('Google sign out error:', error);
      }

      // Clear Cognito session
      if (this.currentUser) {
        this.currentUser.signOut();
        this.currentUser = null;
      }

      // Clear all secure storage
      const keysToRemove = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keysToRemove);

      // Clear any auth attempts tracking
      const allKeys = await AsyncStorage.getAllKeys();
      const authAttemptKeys = allKeys.filter(key => 
        key.startsWith(`${STORAGE_KEYS.AUTH_ATTEMPTS}:`) || 
        key.startsWith(`${STORAGE_KEYS.AUTH_LOCKOUT}:`)
      );
      if (authAttemptKeys.length > 0) {
        await AsyncStorage.multiRemove(authAttemptKeys);
      }

      this.lastTokenRefresh = 0;
      this.biometricEnabled = false;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out completely');
    }
  }

  async resetPassword({ email }: ResetPasswordInput): Promise<void> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
      Storage: AsyncStorage as any,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  }

  async confirmResetPassword({ email, code, newPassword }: ConfirmResetPasswordInput): Promise<void> {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
      Storage: AsyncStorage as any,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  }

  async enableBiometricLogin(enable: boolean): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!compatible || !enrolled) return false;

    this.biometricEnabled = enable;
    if (!enable) {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_CREDENTIALS);
    }
    
    return true;
  }

  private async getUserAttributes(cognitoUser: CognitoUser): Promise<AuthUser> {
    return new Promise((resolve, reject) => {
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const user: AuthUser = {
          id: '',
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          emailVerified: false,
          phoneVerified: false,
        };

        attributes?.forEach((attr) => {
          switch (attr.getName()) {
            case 'sub':
              user.id = attr.getValue();
              break;
            case 'email':
              user.email = attr.getValue();
              break;
            case 'given_name':
              user.firstName = attr.getValue();
              break;
            case 'family_name':
              user.lastName = attr.getValue();
              break;
            case 'phone_number':
              user.phoneNumber = attr.getValue();
              break;
            case 'email_verified':
              user.emailVerified = attr.getValue() === 'true';
              break;
            case 'phone_number_verified':
              user.phoneVerified = attr.getValue() === 'true';
              break;
          }
        });

        resolve(user);
      });
    });
  }

  private async restoreSession(): Promise<void> {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.COGNITO_SESSION);
      if (session) {
        const { Username, RefreshToken } = JSON.parse(session);
        this.currentUser = new CognitoUser({
          Username,
          Pool: userPool,
          Storage: AsyncStorage as any,
        });

        await this.refreshSession();
        this.startSessionRefreshTimer();
      }
    } catch (error) {
      console.warn('Failed to restore session:', error);
    }
  }

  private async refreshSession(): Promise<void> {
    if (!this.currentUser) return;

    const now = Date.now();
    if (now - this.lastTokenRefresh < MIN_REFRESH_INTERVAL) {
      return;
    }

    try {
      // Validate network security
      await this.validateNetworkState();

      return new Promise<void>((resolve, reject) => {
        this.currentUser!.getSession(async (err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (session) {
            try {
              this.lastTokenRefresh = now;
              await this.secureSessionStorage(session);
              resolve();
            } catch (error) {
              console.error('Session storage error:', error);
              reject(new Error('Failed to store session securely'));
            }
          } else {
            reject(new Error('Invalid session'));
          }
        });
      });
    } catch (error) {
      console.error('Session refresh failed:', error);
      // If session refresh fails, clear the session and force re-login
      await this.signOut();
      throw error;
    }
  }

  private startSessionRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(async () => {
      try {
        await this.refreshSession();
      } catch (error) {
        console.error('Auto session refresh failed:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }

  private stopSessionRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async encryptData(data: string): Promise<string> {
    try {
      // Generate a random IV
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      // Derive key using PBKDF2 with session-specific salt
      const key = CryptoJS.PBKDF2(SESSION_ENCRYPTION_KEY, SALT, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
      });

      // Encrypt the data with AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // Combine IV and encrypted data
      const result = {
        iv: iv.toString(),
        data: encrypted.toString()
      };

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  private async decryptData(encrypted: string): Promise<string> {
    try {
      const { iv, data } = JSON.parse(encrypted);

      // Derive the same key
      const key = CryptoJS.PBKDF2(SESSION_ENCRYPTION_KEY, SALT, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
      });

      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        throw new Error('Failed to decrypt data');
      }

      return decryptedString;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private async checkAuthAttempts(username: string): Promise<void> {
    const now = Date.now();
    const attemptsKey = `${STORAGE_KEYS.AUTH_ATTEMPTS}:${username}`;
    const lockoutKey = `${STORAGE_KEYS.AUTH_LOCKOUT}:${username}`;
    
    // Check if user is locked out
    const lockoutUntil = await AsyncStorage.getItem(lockoutKey);
    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil, 10);
      if (now < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - now) / (60 * 1000));
        throw new Error(`Too many failed attempts. Please try again in ${remainingMinutes} minutes.`);
      }
      await AsyncStorage.removeItem(lockoutKey);
      await AsyncStorage.removeItem(attemptsKey);
    }

    // Get and increment failed attempts
    const attempts = await AsyncStorage.getItem(attemptsKey);
    const failedAttempts = attempts ? parseInt(attempts, 10) : 0;
    
    if (failedAttempts >= MAX_AUTH_ATTEMPTS) {
      const lockoutUntil = now + AUTH_LOCKOUT_TIME;
      await AsyncStorage.setItem(lockoutKey, lockoutUntil.toString());
      throw new Error('Too many failed attempts. Please try again later.');
    }
  }

  private async updateAuthAttempts(username: string, success: boolean): Promise<void> {
    const attemptsKey = `${STORAGE_KEYS.AUTH_ATTEMPTS}:${username}`;
    if (success) {
      await AsyncStorage.removeItem(attemptsKey);
    } else {
      const attempts = await AsyncStorage.getItem(attemptsKey);
      const failedAttempts = (attempts ? parseInt(attempts, 10) : 0) + 1;
      await AsyncStorage.setItem(attemptsKey, failedAttempts.toString());
    }
  }

  private async secureSessionStorage(session: CognitoUserSession): Promise<void> {
    const sessionData = {
      accessToken: session.getAccessToken().getJwtToken(),
      idToken: session.getIdToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      username: this.currentUser!.getUsername(),
      timestamp: Date.now()
    };

    const encryptedSession = await this.encryptData(JSON.stringify(sessionData));
    await AsyncStorage.setItem(STORAGE_KEYS.COGNITO_SESSION, encryptedSession);
  }

  private validateNetworkState = async (): Promise<void> => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    if (state.type === 'cellular' && state.details?.cellularGeneration === '2g') {
      throw new Error('Unsecure network connection. Please use a more secure network.');
    }
  }
}
