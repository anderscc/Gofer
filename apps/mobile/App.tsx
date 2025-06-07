import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { TaskCard, Task, TaskCategory, TaskStatus } from '@gofer/ui';
import * as Location from 'expo-location';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { TaskDetailsScreen } from './src/screens/TaskDetailsScreen';
import type { TabParamList, RootStackParamList } from './src/types/navigation';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Sample task data (same as web app)
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Help moving furniture',
    description: 'Need help moving a couch and two chairs from my apartment to a moving truck.',
    category: TaskCategory.MOVING,
    status: TaskStatus.OPEN,
    budget: {
      amount: 50,
      currency: 'USD',
    },
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA',
    },
    createdBy: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      joinedDate: new Date(),
    },
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'House Cleaning',
    description: 'Need thorough cleaning of 2-bedroom apartment, including kitchen and bathrooms.',
    category: TaskCategory.CLEANING,
    status: TaskStatus.OPEN,
    budget: {
      amount: 80,
      currency: 'USD',
    },
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: 'San Francisco, CA',
    },
    createdBy: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      joinedDate: new Date(),
    },
    createdAt: new Date(),
  },
];

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          switch (route.name) {
            case 'Tasks':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'MyTasks':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: 'Browse Tasks',
        }}
      />
      <Tab.Screen
        name="MyTasks"
        component={MyTasksScreen}
        options={{
          title: 'My Tasks',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Messages',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function TasksScreen() {
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
    })();
  }, []);

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetails', { task });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Tasks</Text>
        <Text style={styles.subtitle}>
          {location 
            ? `Tasks near ${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`
            : 'Find tasks that match your skills'}
        </Text>
      </View>
      {sampleTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={handleTaskPress}
        />
      ))}
    </ScrollView>
  );
}

function MyTasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });
        
        // Simulate some async loading
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetailsScreen}
          options={{ 
            title: 'Task Details',
            headerBackTitle: 'Back',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
});
