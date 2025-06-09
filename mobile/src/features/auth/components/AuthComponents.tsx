import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardTypeOptions,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing } from '../../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  style?: ViewStyle;
  icon?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
  icon,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {icon && (
          <Feather 
            name={icon as any} 
            size={20} 
            color={colors.textSecondary} 
            style={styles.inputIcon} 
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'text';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch(variant) {
      case 'outline':
        return [styles.button, styles.buttonOutline, style];
      case 'text':
        return [styles.button, styles.buttonText, style];
      default:
        return [styles.button, styles.buttonPrimary, style];
    }
  };

  const getTextStyle = () => {
    switch(variant) {
      case 'outline':
        return [styles.buttonTextStyle, styles.buttonOutlineText, textStyle];
      case 'text':
        return [styles.buttonTextStyle, styles.buttonTextOnly, textStyle];
      default:
        return [styles.buttonTextStyle, styles.buttonPrimaryText, textStyle];
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled || isLoading ? styles.buttonDisabled : null]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <Text style={getTextStyle()}>Loading...</Text>
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
  },
  button: {
    height: 55,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonTextStyle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  buttonPrimaryText: {
    color: colors.background,
  },
  buttonOutlineText: {
    color: colors.primary,
  },
  buttonTextOnly: {
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
