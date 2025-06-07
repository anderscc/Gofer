import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import type { Task } from '@gofer/api-client';

interface TaskListProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
  onRefresh?: () => Promise<void>;
}

export function TaskList({ tasks, onTaskPress, onRefresh }: TaskListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

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
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => onTaskPress?.(task)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
