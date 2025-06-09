import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Task } from '../../../data/mockData';
import { colors, spacing, borders, typography, shadows } from '../../../constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const TaskCard = ({ task, onPress }: TaskCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: task.image }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
          <Text style={styles.price}>${task.price}/hr</Text>
        </View>
        
        <View style={styles.category}>
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={styles.location}>{task.location} • {task.distance}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color="#FFBF00" />
            <Text style={styles.rating}>{task.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borders.radius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
    width: 240,
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  price: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  category: {
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default TaskCard;
