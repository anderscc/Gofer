import React, { useState } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useAuth } from '@gofer/auth';
import { Button, Card } from '@gofer/ui';
import { TextInput } from 'react-native';

export function SignInScreen() {
  const { signIn, signInWithGoogle, signInWithApple, signInWithBiometrics, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signIn({ email, password });
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            onPress={handleSignIn}
            loading={isLoading}
            disabled={isLoading}
          >
            Sign In
          </Button>

          <View style={styles.divider} />

          <Button
            onPress={signInWithBiometrics}
            variant="outline"
            disabled={isLoading}
          >
            Sign in with Face ID
          </Button>

          <Button
            onPress={signInWithGoogle}
            variant="outline"
            disabled={isLoading}
          >
            Continue with Google
          </Button>

          {Platform.OS === 'ios' && (
            <Button
              onPress={signInWithApple}
              variant="outline"
              disabled={isLoading}
            >
              Continue with Apple
            </Button>
          )}

          {error && (
            <Text style={styles.error}>{error.message}</Text>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
});
