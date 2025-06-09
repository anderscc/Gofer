import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormInput, AuthButton } from '../components/AuthComponents';
import { colors, typography, spacing } from '../../../constants/theme';
import { useAuth } from '../../../providers/AuthProvider';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation states
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { signUp, isLoading, error, setError } = useAuth();

  const validateForm = () => {
    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError(null);
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError(null);
    }

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

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email, password, {
        given_name: firstName,
        family_name: lastName,
        name: `${firstName} ${lastName}`,
      });

      // Navigate to verification screen
      navigation.navigate('ConfirmSignUp' as never, { email } as never);
    } catch (err) {
      // Error is handled by the store
      console.log('Sign up error:', err);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start using Gofer</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.nameRow}>
              <FormInput
                label="First Name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setFirstNameError(null);
                  setError(null);
                }}
                placeholder="Enter first name"
                error={firstNameError}
                style={styles.nameInput}
                icon="user"
              />

              <FormInput
                label="Last Name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setLastNameError(null);
                  setError(null);
                }}
                placeholder="Enter last name"
                error={lastNameError}
                style={styles.nameInput}
                icon="users"
              />
            </View>

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
              placeholder="Create a password"
              secureTextEntry
              error={passwordError}
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
              placeholder="Confirm your password"
              secureTextEntry
              error={confirmPasswordError}
              icon="lock"
            />

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Text>

            <AuthButton
              title="Sign Up"
              onPress={handleSignUp}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn' as never)}>
              <Text style={styles.signInText}>Sign In</Text>
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  passwordHint: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  signInText: {
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
});

export default SignUpScreen;
