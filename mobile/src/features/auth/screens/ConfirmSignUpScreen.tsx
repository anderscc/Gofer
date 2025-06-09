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
  ConfirmSignUp: {
    email: string;
  };
};

const ConfirmSignUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ConfirmSignUp'>>();
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const { confirmSignUp, isLoading, error, setError } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;

    if (!code || code.length < 6) {
      setCodeError('Please enter a valid verification code');
      isValid = false;
    } else {
      setCodeError(null);
    }

    return isValid;
  };

  const handleConfirmSignUp = async () => {
    if (!validateForm()) return;

    try {
      await confirmSignUp(email, code);
      Alert.alert(
        'Account Verified',
        'Your account has been successfully verified. Please sign in with your credentials.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('SignIn' as never) 
          }
        ]
      );
    } catch (err) {
      console.log('Confirmation error:', err);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      await authService.resendConfirmationCode(email);
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
            <Text style={styles.title}>Verify Account</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to {email}
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
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              error={codeError}
              icon="shield"
            />

            <AuthButton
              title="Verify Account"
              onPress={handleConfirmSignUp}
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

export default ConfirmSignUpScreen;
