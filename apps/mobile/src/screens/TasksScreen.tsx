import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TaskMap, TaskList } from '@gofer/ui';
import type { Task } from '@gofer/api-client';
import type { RootStackParamList } from '../types/navigation';

const Tab = createMaterialTopTabNavigator();

interface TasksListViewProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

function TasksListView({ tasks, onTaskPress }: TasksListViewProps) {
  return (
    <TaskList
      tasks={tasks}
      onTaskPress={onTaskPress}
    />
  );
}

interface TasksMapViewProps {
  tasks: Task[];
  userLocation: Location.LocationObject | null;
  onTaskSelect: (task: Task) => void;
}

function TasksMapView({ tasks, userLocation, onTaskSelect }: TasksMapViewProps) {
  return (
    <TaskMap
      tasks={tasks}
      initialRegion={userLocation ? {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      } : undefined}
      onTaskSelect={onTaskSelect}
    />
  );
}

export function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // TODO: Fetch tasks from API using location
      // For now, using sample tasks
    })();
  }, []);

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetails', { task });
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator>
        <Tab.Screen name="List">
          {() => (
            <TasksListView
              tasks={tasks}
              onTaskPress={handleTaskPress}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Map">
          {() => (
            <TasksMapView
              tasks={tasks}
              userLocation={location}
              onTaskSelect={handleTaskPress}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
