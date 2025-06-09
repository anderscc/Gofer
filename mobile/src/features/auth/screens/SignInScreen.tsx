import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { FormInput, AuthButton } from '../components/AuthComponents';
import { colors, typography, spacing } from '../../../constants/theme';
import { useAuth } from '../../../providers/AuthProvider';

const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const { 
    login, 
    loginWithBiometrics, 
    isLoading, 
    error, 
    isBiometricAvailable,
    isBiometricEnabled,
  } = useAuth();
  
  const setError = () => {}; // setError is not provided by the hook, so we create an empty function

  useEffect(() => {
    // Check if device supports biometric authentication
    const checkBiometricSupport = async () => {
      const supported = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(supported);
    };

    checkBiometricSupport();
  }, []);

  // Try biometric login when component mounts if enabled
  useEffect(() => {
    if (isBiometricEnabled && isBiometricAvailable) {
      handleBiometricLogin();
    }
  }, [isBiometricEnabled, isBiometricAvailable]);

  const validateForm = () => {
    let isValid = true;

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError(null);
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Navigation will be handled by the AuthNavigator
    } catch (err) {
      // Error is handled by the store
      console.log('Sign in error:', err);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await loginWithBiometrics();
      if (!success) {
        // Show fallback to regular login
        Alert.alert(
          'Biometric Authentication Failed',
          'Please sign in with your email and password.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.log('Biometric login error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Welcome back to Gofer</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <FormInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(null);
                setError(null);
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              icon="mail"
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
                setError(null);
              }}
              placeholder="Enter your password"
              secureTextEntry
              error={passwordError}
              icon="lock"
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword' as never)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AuthButton
              title="Sign In"
              onPress={handleSignIn}
              isLoading={isLoading}
              disabled={isLoading}
            />

            {isBiometricSupported && isBiometricEnabled && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >              <Feather name="key" size={24} color={colors.primary} />
              <Text style={styles.biometricText}>Sign in with biometrics</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  signUpText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  errorContainer: {
    backgroundColor: `${colors.error}20`,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  biometricText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default SignInScreen;
