import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';

interface LoadingIndicatorProps {
  visible: boolean;
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ visible, message }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    minHeight: 100,
  },
  message: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
