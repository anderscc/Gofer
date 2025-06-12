import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AuthButton } from '../components/AuthButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../providers';

export const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, resendEmailVerification, checkEmailVerification, isLoading, error, clearError } = useAuth();
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  useEffect(() => {
    // Auto-check verification status every 3 seconds
    const interval = setInterval(async () => {
      if (user && !user.emailVerified) {
        const isVerified = await checkEmailVerification();
        if (isVerified) {
          Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified.',
            [{ text: 'Continue', onPress: () => navigation.goBack() }]
          );
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, checkEmailVerification, navigation]);

  const handleResendEmail = async () => {
    try {
      await resendEmailVerification();
      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your email address.',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.log('Resend email error:', err.message);
    }
  };

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        Alert.alert(
          'Email Verified!',
          'Your email has been successfully verified.',
          [{ text: 'Continue', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Email Not Verified',
          'Your email is not yet verified. Please check your email and click the verification link.',
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      console.log('Check verification error:', err.message);
    } finally {
      setIsCheckingVerification(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="mail" size={64} color="#007AFF" />
          </View>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to{'\n'}
            <Text style={styles.email}>{user?.email}</Text>
          </Text>
          <Text style={styles.description}>
            Click the link in the email to verify your account. You may need to check your spam folder.
          </Text>
        </View>

        <View style={styles.actions}>
          {error && <ErrorMessage message={error} />}
          
          <AuthButton
            title="Check Verification Status"
            onPress={handleCheckVerification}
            isLoading={isCheckingVerification}
          />

          <AuthButton
            title="Resend Email"
            onPress={handleResendEmail}
            isLoading={isLoading}
            variant="secondary"
          />

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.skipText}>I'll verify later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: '#007AFF',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 48,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
});
