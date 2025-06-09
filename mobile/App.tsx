import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { 
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import AuthNavigator from './src/navigation/AuthNavigator';
import AuthProvider from './src/providers/AuthProvider';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // If preventAutoHideAsync fails, we just continue
  console.warn("SplashScreen.preventAutoHideAsync failed");
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
        });

        // Remove artificial delay 
        // await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("Error loading fonts:", e);
        setInitError("Failed to load app resources");
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // This ensures the splash screen is hidden even if onLayoutRootView isn't called
    if (appIsReady) {
      SplashScreen.hideAsync().catch(e => {
        console.warn("Error hiding splash screen:", e);
      });
    }
  }, [appIsReady]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error in onLayoutRootView:", e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }
  
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {initError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AuthProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
