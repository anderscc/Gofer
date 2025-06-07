import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { CreateTaskForm } from '@gofer/ui';
import type { CreateTaskInput } from '@gofer/api-client';
import type { RootStackParamList } from '../types/navigation';

export function CreateTaskScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = async (taskData: CreateTaskInput) => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // TODO: Show error message
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const task = {
        ...taskData,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address[0] ? `${address[0].city}, ${address[0].region}` : 'Unknown Location',
        },
      };

      // TODO: Call API to create task
      console.log('Creating task:', task);

      navigation.navigate('Tasks');
    } catch (error) {
      // TODO: Show error message
      console.error('Error creating task:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CreateTaskForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
