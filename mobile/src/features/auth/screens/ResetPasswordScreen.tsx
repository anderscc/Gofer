import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FormInput, AuthButton } from '../components/AuthComponents';
import { colors, typography, spacing } from '../../../constants/theme';
import { useAuth } from '../../../providers/AuthProvider';
import { authService } from '../../../services/auth/authService';

type RouteParams = {
  ResetPassword: {
    email: string;
  };
};

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ResetPassword'>>();
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { confirmResetPassword, isLoading, error, setError } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    if (!code) {
      setCodeError('Verification code is required');
      isValid = false;
    } else {
      setCodeError(null);
    }

    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setNewPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await confirmResetPassword(email, code, newPassword);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. Please sign in with your new password.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('SignIn' as never) 
          }
        ]
      );
    } catch (err) {
      console.log('Reset password error:', err);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      await authService.forgotPassword(email);
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email address.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the verification code sent to {email} and create a new password
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <FormInput
              label="Verification Code"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setCodeError(null);
                setError(null);
              }}
              placeholder="Enter verification code"
              keyboardType="number-pad"
              error={codeError}
              icon="shield"
            />

            <FormInput
              label="New Password"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setNewPasswordError(null);
                setError(null);
              }}
              placeholder="Create a new password"
              secureTextEntry
              error={newPasswordError}
              icon="lock"
            />

            <FormInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError(null);
                setError(null);
              }}
              placeholder="Confirm your new password"
              secureTextEntry
              error={confirmPasswordError}
              icon="lock"
            />

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Text>

            <AuthButton
              title="Reset Password"
              onPress={handleResetPassword}
              isLoading={isLoading}
              disabled={isLoading || resendLoading}
            />

            <View style={styles.resendCodeContainer}>
              <Text style={styles.resendText}>Didn't receive a code?</Text>
              <TouchableOpacity 
                onPress={handleResendCode}
                disabled={isLoading || resendLoading}
              >
                <Text style={styles.resendButton}>
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
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
  passwordHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  resendCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  resendButton: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
});

export default ResetPasswordScreen;
