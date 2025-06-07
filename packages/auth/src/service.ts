import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignUpInput, SignInInput, ResetPasswordInput, ConfirmResetPasswordInput, AuthUser } from './types';

export class AuthService {
  private cognito: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor(config: { userPoolId: string; clientId: string; region: string }) {
    this.cognito = new CognitoIdentityProviderClient({ region: config.region });
    this.userPoolId = config.userPoolId;
    this.clientId = config.clientId;

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    });
  }

  // Email/Password Authentication
  async signUp({ email, password, firstName, lastName, phoneNumber }: SignUpInput): Promise<void> {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'phone_number', Value: phoneNumber },
        { Name: 'email', Value: email },
      ],
    });

    await this.cognito.send(command);
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
    });

    await this.cognito.send(command);
  }

  async signIn({ email, password }: SignInInput): Promise<AuthUser> {
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await this.cognito.send(command);
    const token = response.AuthenticationResult?.IdToken;
    
    if (!token) {
      throw new Error('Failed to authenticate');
    }

    // Store the token
    await AsyncStorage.setItem('auth_token', token);

    // Parse and return user data from token
    return this.parseUserFromToken(token);
  }

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
    // Sign out from social providers
    await GoogleSignin.signOut().catch(() => {});
  }

  // Social Authentication
  async signInWithGoogle(): Promise<AuthUser> {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: 'CUSTOM_AUTH',
      AuthParameters: {
        TOKEN: idToken,
      },
    });

    const response = await this.cognito.send(command);
    const token = response.AuthenticationResult?.IdToken;
    
    if (!token) {
      throw new Error('Failed to authenticate with Google');
    }

    await AsyncStorage.setItem('auth_token', token);
    return this.parseUserFromToken(token);
  }

  async signInWithApple(): Promise<AuthUser> {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      const command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
          TOKEN: identityToken,
        },
      });

      const response = await this.cognito.send(command);
      const token = response.AuthenticationResult?.IdToken;
      
      if (!token) {
        throw new Error('Failed to authenticate with Apple');
      }

      await AsyncStorage.setItem('auth_token', token);
      return this.parseUserFromToken(token);
    } catch (error) {
      console.error('Apple authentication error:', error);
      throw error;
    }
  }

  // Password Reset
  async resetPassword({ email }: ResetPasswordInput): Promise<void> {
    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
    });

    await this.cognito.send(command);
  }

  async confirmResetPassword({ email, code, newPassword }: ConfirmResetPasswordInput): Promise<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await this.cognito.send(command);
  }

  // Biometric Authentication
  async isBiometricsAvailable(): Promise<boolean> {
    const available = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return available && enrolled;
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use password',
    });
    return result.success;
  }

  // Helper methods
  private parseUserFromToken(token: string): AuthUser {
    // Decode JWT token and extract user info
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload['given_name'],
      lastName: payload['family_name'],
      phoneNumber: payload['phone_number'],
      emailVerified: payload['email_verified'],
      phoneVerified: payload['phone_number_verified'],
    };
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }
}
