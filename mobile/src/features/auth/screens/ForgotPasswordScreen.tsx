import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormInput, AuthButton } from '../components/AuthComponents';
import { colors, typography, spacing } from '../../../constants/theme';
import { useAuth } from '../../../providers/AuthProvider';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const { resetPassword, isLoading, error, setError } = useAuth();

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError(null);
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      // Navigate to reset password confirmation screen
      navigation.navigate('ResetPassword' as never, { email } as never);
    } catch (err) {
      // Error is handled by the store
      console.log('Reset password error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a code to reset your password
            </Text>
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

            <AuthButton
              title="Send Reset Code"
              onPress={handleResetPassword}
              isLoading={isLoading}
              disabled={isLoading}
            />

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
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
  backButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
