import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  className?: string;
}

export function Input({
  variant = 'outline',
  size = 'md',
  error = false,
  className = '',
  ...props
}: InputProps) {
  const inputStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Height`],
    error && styles.error,
    props.multiline && styles.multiline,
  ];

  if (Platform.OS === 'web') {
    return (
      <input
        {...(props as any)}
        className={`${baseWebStyles} ${variantWebStyles[variant]} ${error ? errorWebStyles : ''} ${className}`}
      />
    );
  }

  return (
    <TextInput
      {...props}
      style={inputStyles}
      placeholderTextColor={colors.neutral[400]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: radii.md,
    fontSize: typography.fontSizes.md,
    color: colors.neutral[900],
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: colors.neutral[100],
    borderWidth: 0,
  },
  smHeight: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  mdHeight: {
    height: 40,
    paddingHorizontal: spacing.md,
  },
  lgHeight: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  error: {
    borderColor: colors.error,
  },
  multiline: {
    height: undefined,
    minHeight: 100,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
});

// Web-specific styles using Tailwind classes
const baseWebStyles = `
  block w-full px-3 py-2 text-sm
  rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
  transition-colors duration-200
`;

const variantWebStyles = {
  outline: `
    border border-gray-300
    focus:border-indigo-500 focus:ring-indigo-500
    bg-transparent
  `,
  filled: `
    border-0 bg-gray-100
    focus:bg-gray-50 focus:ring-indigo-500
  `,
};

const errorWebStyles = `
  border-red-500 focus:border-red-500 focus:ring-red-500
`;
