import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TaskMap, TaskList } from '@gofer/ui';
import type { Task } from '@gofer/api-client';
import { TasksApi } from '@gofer/api-client';
import type { SearchParams } from '@gofer/search';
import type { RootStackParamList } from '../types/navigation';
import debounce from 'lodash/debounce';
import { theme } from '@gofer/ui';

const Tab = createMaterialTopTabNavigator();
const DEFAULT_SEARCH_RADIUS = 20; // 20km radius

interface TasksListViewProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onLoadMore: () => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function TasksListView({ 
  tasks, 
  onTaskPress,
  onLoadMore,
  onRefresh,
  isLoading,
  error 
}: TasksListViewProps) {
  return (
    <TaskList
      tasks={tasks}
      onTaskPress={onTaskPress}
      onLoadMore={onLoadMore}
      onRefresh={onRefresh}
      isLoading={isLoading}
      error={error}
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
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'distance'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasksApi = new TasksApi(process.env.EXPO_PUBLIC_API_URL || '');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Initialize search with user's location
        setSearchParams(prev => ({
          ...prev,
          location: {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            radius: DEFAULT_SEARCH_RADIUS
          }
        }));
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get your location');
      }
    })();
  }, []);

  const searchTasks = useCallback(async (append: boolean = false) => {
    try {
      setIsLoading(true);
      const result = await tasksApi.searchTasks(searchParams);
      setTasks(prev => append ? [...prev, ...result.items] : result.items);
      setHasMore(result.hasMore);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error searching tasks:', error);
      setErrorMsg('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, tasksApi]);

  useEffect(() => {
    searchTasks();
  }, [searchParams, searchTasks]);

  const handleSearch = debounce((query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query,
      page: 1
    }));
  }, 300);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setSearchParams(prev => ({
        ...prev,
        page: (prev.page || 1) + 1
      }));
    }
  };

  const handleRefresh = async () => {
    setSearchParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleTaskPress = useCallback((task: Task) => {
    navigation.navigate('TaskDetails', { task });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          onChangeText={handleSearch}
          placeholderTextColor={theme.colors.neutral[400]}
        />
      </View>

      <Tab.Navigator>
        <Tab.Screen name="List">
          {() => (
            <TasksListView
              tasks={tasks}
              onTaskPress={handleTaskPress}
              onLoadMore={handleLoadMore}
              onRefresh={handleRefresh}
              isLoading={isLoading}
              error={errorMsg}
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
    backgroundColor: theme.background,
  },
  searchContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  searchInput: {
    backgroundColor: theme.colors.neutral[100],
    borderRadius: 8,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.neutral[900],
  },
});
