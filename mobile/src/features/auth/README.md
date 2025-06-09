# Authentication Module

This module provides a complete authentication solution for the Gofer mobile app using AWS Cognito.

## Features

- **User Registration & Sign Up**
  - Email-based registration
  - Email verification via confirmation code
  - Complete user profile during sign up

- **Authentication**
  - Email/Password login
  - Biometric authentication (fingerprint/Face ID)
  - Token refresh mechanism
  - Secure token storage

- **Password Management**
  - Forgot password flow
  - Reset password
  - Change password (when logged in)

- **Session Management**
  - Auto login with saved credentials
  - Secure token storage
  - Token refresh handling

## Components and Files

### Screens

- `WelcomeScreen.tsx` - Initial landing screen with sign in/sign up options
- `SignInScreen.tsx` - Login screen with biometric option
- `SignUpScreen.tsx` - Registration screen
- `ConfirmSignUpScreen.tsx` - Email verification screen
- `ForgotPasswordScreen.tsx` - Password reset request screen
- `ResetPasswordScreen.tsx` - Password reset confirmation screen
- `ProfileScreen.tsx` - User profile with sign out option

### Services

- `authService.ts` - Core authentication methods for Cognito
- `authStore.ts` - Zustand store for auth state management

### Utils

- `authStorage.ts` - Token and user data persistence
- `biometricUtils.ts` - Biometric authentication utilities
- `tokenManager.ts` - JWT token management and refresh

### Navigation

- `AuthNavigator.tsx` - Navigation flow for authentication
- `types.ts` - TypeScript typings for navigation

## Usage

The authentication flow is integrated with the app via the AuthProvider component and can be accessed anywhere in the app using the `useAuth` hook:

```typescript
import { useAuth } from '../providers/AuthProvider';

const MyComponent = () => {
  const { 
    isAuthenticated,
    user,
    login,
    logout
  } = useAuth();
  
  // Use authentication methods and state
};
```

## Biometric Authentication

Biometric authentication is supported if the device has the capability. Users can enable it in the profile screen after logging in. The app will remember the user's preference and offer biometric login on subsequent launches.

## Security Features

- JWT token storage in AsyncStorage
- Automatic token refresh
- Credentials are never stored directly (only tokens)
- Biometric authentication uses device's secure storage

## Configuration

Configure AWS Cognito settings in `authService.ts`:

```typescript
const awsConfig = {
  Auth: {
    region: 'us-east-1', // Replace with your AWS region
    userPoolId: 'us-east-1_xxxxxxxx', // Replace with your Cognito User Pool ID
    userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxx', // Replace with your App Client ID
    // ... other settings
  }
};
```
