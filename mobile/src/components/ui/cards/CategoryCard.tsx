import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borders, typography } from '../../../constants/theme';
import { ServiceCategory } from '../../../data/mockData';

interface CategoryCardProps {
  category: ServiceCategory;
  onPress: () => void;
}

const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}20` }]}>
        <Feather name={category.icon as any} size={22} color={category.color} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 72,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borders.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlign: 'center',
  },
});

export default CategoryCard;
