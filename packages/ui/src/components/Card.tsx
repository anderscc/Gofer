import { View, Text, StyleSheet, Platform, Dimensions, useWindowDimensions } from 'react-native';
import type { PropsWithChildren } from 'react';

export interface CardProps extends PropsWithChildren {
  title?: string;
  elevation?: number;
}

export function Card({ title, children, elevation = 1 }: CardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > 768;

  return (
    <View style={[
      styles.card,
      { 
        elevation,
        maxWidth: isLargeScreen ? 600 : windowWidth - 32,
        padding: isLargeScreen ? 24 : 16
      }
    ]}>
      {title && <Text style={[
        styles.title,
        { fontSize: isLargeScreen ? 20 : 18 }
      ]}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
});
