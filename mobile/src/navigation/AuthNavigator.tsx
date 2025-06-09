import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../providers/AuthProvider';

// Authentication screens
import WelcomeScreen from '../features/auth/screens/WelcomeScreen';
import SignInScreen from '../features/auth/screens/SignInScreen';
import SignUpScreen from '../features/auth/screens/SignUpScreen';
import ConfirmSignUpScreen from '../features/auth/screens/ConfirmSignUpScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../features/auth/screens/ResetPasswordScreen';

// Use the existing ProfileScreen component if available, otherwise use our version
import ProfileScreen from '../features/auth/screens/ProfileScreen';

// Main app navigation (contains all screens when authenticated)
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

const AuthNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If still loading, we'll render a placeholder navigator to avoid rendering issues
  // but the actual loading indicator will be shown through the AuthProvider's LoadingIndicator
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is signed in
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // User is not signed in
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
