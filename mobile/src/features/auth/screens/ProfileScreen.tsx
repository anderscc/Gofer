import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, shadows } from '../../../constants/theme';
import { useAuth } from '../../../providers/AuthProvider';
import * as LocalAuthentication from 'expo-local-authentication';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    logout, 
    isBiometricAvailable, 
    isBiometricEnabled,
    toggleBiometricLogin,
  } = useAuth();
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricToggleEnabled, setIsBiometricToggleEnabled] = useState(isBiometricEnabled);

  useEffect(() => {
    // Check if device supports biometric authentication
    const checkBiometricSupport = async () => {
      const supported = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(supported);
    };

    checkBiometricSupport();
  }, []);

  // Update local state when store state changes
  useEffect(() => {
    setIsBiometricToggleEnabled(isBiometricEnabled);
  }, [isBiometricEnabled]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the AuthNavigator
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric login - verify with authentication first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use password instead',
      });

      if (result.success) {
        const success = await toggleBiometricLogin(true, user?.username);
        if (!success) {
          Alert.alert('Error', 'Failed to enable biometric login');
          setIsBiometricToggleEnabled(false);
        }
      } else {
        // Authentication failed, revert toggle
        setIsBiometricToggleEnabled(false);
      }
    } else {
      // Disable biometric login
      const success = await toggleBiometricLogin(false);
      if (!success) {
        Alert.alert('Error', 'Failed to disable biometric login');
        setIsBiometricToggleEnabled(true);
      }
    }
  };

  const fullName = user?.attributes?.name || user?.username || 'User';
  const email = user?.attributes?.email || 'No email provided';
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user?.attributes?.picture ? (
              <Image 
                source={{ uri: user.attributes.picture }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.initialsContainer}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <Feather name="user" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword' as never)}
          >
            <Feather name="lock" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Change Password</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentMethods' as never)}
          >
            <Feather name="credit-card" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          {isBiometricSupported && (
            <View style={styles.menuItem}>
              <Feather name="unlock" size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>Biometric Login</Text>
              <Switch
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={isBiometricToggleEnabled ? colors.primary : colors.background}
                ios_backgroundColor={colors.border}
                onValueChange={handleBiometricToggle}
                value={isBiometricToggleEnabled}
              />
            </View>
          )}

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Feather name="bell" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Privacy' as never)}
          >
            <Feather name="shield" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Privacy</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Help' as never)}
          >
            <Feather name="help-circle" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('About' as never)}
          >
            <Feather name="info" size={22} color={colors.primary} />
            <Text style={styles.menuItemText}>About Gofer</Text>
            <Feather name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Feather name="log-out" size={22} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.background,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginVertical: spacing.sm,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginLeft: spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    padding: spacing.md,
    marginVertical: spacing.lg,
  },
  signOutText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});

export default ProfileScreen;
