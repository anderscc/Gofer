import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import type { Task } from '../types';
import { Card } from './Card';

export interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isLargeScreen = windowWidth > 768;

  const handlePress = () => {
    onPress?.(task);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Card>
        <View style={[
          styles.header,
          isLargeScreen && styles.headerLarge
        ]}>
          <Text style={[
            styles.title,
            isLargeScreen && styles.titleLarge
          ]} numberOfLines={2}>
            {task.title}
          </Text>
          <Text style={[
            styles.budget,
            isLargeScreen && styles.budgetLarge
          ]}>
            {task.budget.currency} {task.budget.amount}
          </Text>
        </View>
        <Text style={[
          styles.description,
          isLargeScreen && styles.descriptionLarge
        ]} numberOfLines={isLargeScreen ? 3 : 2}>
          {task.description}
        </Text>
        <View style={[
          styles.footer,
          isLargeScreen && styles.footerLarge
        ]}>
          <Text style={[
            styles.location,
            isLargeScreen && styles.locationLarge
          ]}>
            {task.location.address}
          </Text>
          <Text style={[
            styles.category,
            isLargeScreen && styles.categoryLarge
          ]}>
            {task.category}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLarge: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  titleLarge: {
    fontSize: 20,
  },
  budget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  budgetLarge: {
    fontSize: 18,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descriptionLarge: {
    fontSize: 16,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLarge: {
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  locationLarge: {
    fontSize: 14,
  },
  category: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  categoryLarge: {
    fontSize: 14,
  },
});
