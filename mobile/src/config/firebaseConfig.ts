import { initializeApp, getApps } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDnuFGMm-rfTujEWLme-S68Fcermz2zVY4',
  authDomain: 'gofer-1aa72.firebaseapp.com',
  projectId: 'gofer-1aa72',
  storageBucket: 'gofer-1aa72.firebasestorage.app',
  messagingSenderId: '822351247640',
  appId: '1:822351247640:ios:8225a5c7189ddc2bc4066d',
};

// Initialize Firebase app only if it hasn't been initialized
console.log('Initializing Firebase app with config:', firebaseConfig);
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('Firebase app initialized:', app.name);

// Initialize Auth with persistence for React Native
console.log('Initializing Firebase Auth with React Native persistence');
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
console.log('Firebase Auth initialized:', auth);