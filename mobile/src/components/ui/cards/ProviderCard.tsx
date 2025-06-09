import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskProvider } from '../../../data/mockData';
import { colors, spacing, borders, typography, shadows } from '../../../constants/theme';

interface ProviderCardProps {
  provider: TaskProvider;
  onPress: () => void;
}

const ProviderCard = ({ provider, onPress }: ProviderCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: provider.avatar }}
          style={styles.avatar}
        />
        <View style={styles.nameWrapper}>
          <Text style={styles.name} numberOfLines={1}>{provider.name}</Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color="#FFBF00" solid />
            <Text style={styles.rating}>{provider.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{provider.completedTasks}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{provider.responseRate}%</Text>
          <Text style={styles.statLabel}>Response</Text>
        </View>
      </View>
      
      <View style={styles.categories}>
        {provider.categories.map((category, index) => (
          <View key={index} style={styles.categoryPill}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borders.radius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 190,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.sm,
  },
  nameWrapper: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryPill: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: borders.radius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});

export default ProviderCard;
