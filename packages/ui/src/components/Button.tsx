import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import type { PressableProps } from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  children: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Height`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    Platform.select({
      web: styles.webHover,
      default: {},
    }),
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <Pressable
      {...props}
      disabled={isLoading || disabled}
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && styles.pressed,
      ]}
    >
      {leftIcon}
      <Text style={textStyles}>{isLoading ? 'Loading...' : children}</Text>
      {rightIcon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  smHeight: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  mdHeight: {
    height: 40,
    paddingHorizontal: spacing.lg,
  },
  lgHeight: {
    height: 48,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  webHover: {
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '150ms',
    ':hover': {
      opacity: 0.9,
    },
  },
  text: {
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
  },
  smText: {
    fontSize: typography.fontSizes.sm,
  },
  mdText: {
    fontSize: typography.fontSizes.md,
  },
  lgText: {
    fontSize: typography.fontSizes.lg,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: colors.primary[500],
  },
  ghostText: {
    color: colors.primary[500],
  },
  disabledText: {
    color: colors.neutral[400],
  },
});
