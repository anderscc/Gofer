import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, View, Text } from 'react-native';
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import type { Task } from '@gofer/api-client';
import { theme } from '../theme';

export interface TaskListProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function TaskList({ 
  tasks, 
  onTaskPress, 
  onRefresh, 
  onLoadMore,
  isLoading,
  error 
}: TaskListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleScroll = (event: any) => {
    if (!onLoadMore) return;

    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;

    if (isCloseToBottom && !isLoading) {
      onLoadMore();
    }
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (tasks.length === 0 && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tasks found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : undefined
      }
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => onTaskPress?.(task)}
        />
      ))}
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error[500],
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.md,
  },
  emptyText: {
    color: theme.colors.neutral[500],
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.md,
  },
  loaderContainer: {
    padding: theme.spacing.lg,
  },
});
