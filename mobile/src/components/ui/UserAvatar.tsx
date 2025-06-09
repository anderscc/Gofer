import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { colors, typography, shadows } from '../../constants/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: any;
}

const UserAvatar: React.FC<AvatarProps> = ({
  uri,
  name = 'User',
  size = 40,
  style,
}) => {
  // Generate initials from name
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = name ? getInitials(name) : 'U';
  const fontSize = size * 0.4;
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={[styles.initialsContainer, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.background,
    fontFamily: typography.fontFamily.bold,
  },
});

export default UserAvatar;
