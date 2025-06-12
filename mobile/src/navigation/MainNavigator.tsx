import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors } from '../constants/theme';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { CreateTaskScreen } from '../screens/CreateTaskScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      {/* Add more screens here related to Home Flow */}
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="clipboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Post" 
        component={CreateTaskScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="plus-circle" color={color} size={28} />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="message-square" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
