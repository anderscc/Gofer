import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const handleSignIn = () => {
    navigation.navigate('SignIn' as never);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=1000' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Gofer</Text>
            </View>
            
            <View style={styles.contentContainer}>
              <Text style={styles.tagline}>Your Tasks, Done Right</Text>
              <Text style={styles.description}>
                Connect with trusted local taskers for help with everyday tasks, from cleaning to delivery, repairs to assistance.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={handleSignIn}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signUpButtonText}>Create an Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 40,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  tagline: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
    marginBottom: spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.background,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    ...shadows.md,
  },
  signInButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: colors.background,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  signUpButtonText: {
    color: colors.background,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
  },
});

export default WelcomeScreen;
