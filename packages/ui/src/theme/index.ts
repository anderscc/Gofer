export const colors = {
  primary: {
    50: '#F0F7FF',
    100: '#E0EFFF',
    200: '#B8DBFF',
    300: '#8AC2FF',
    400: '#5CA8FF',
    500: '#4F46E5', // Main brand color
    600: '#3730A3',
    700: '#312E81',
    800: '#1E1B4B',
    900: '#0C0A1F',
  },
  secondary: {
    50: '#F5FFF0',
    100: '#E8FFE0',
    200: '#BFFFB8',
    300: '#8FFF8A',
    400: '#60FF5C',
    500: '#2E7D32', // Secondary brand color
    600: '#1B5E1F',
    700: '#0F4C13',
    800: '#07350C',
    900: '#021D06',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const theme = {
  colors,
  typography,
  spacing,
  background: '#F9FAFB',
  white: '#FFFFFF',
};
