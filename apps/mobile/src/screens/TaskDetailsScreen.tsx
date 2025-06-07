import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

export function TaskDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { task } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.budget}>
          {task.budget.currency} {task.budget.amount}
        </Text>
      </View>

      <Text style={styles.description}>{task.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#4F46E5" />
          <Text style={styles.locationText}>{task.location.address}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posted by</Text>
        <View style={styles.userContainer}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{task.createdBy.name}</Text>
            <Text style={styles.userJoined}>
              Joined {new Date(task.createdBy.joinedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable 
          style={[styles.button, styles.messageButton]}
          onPress={() => navigation.navigate('Chat', { 
            taskId: task.id, 
            otherUserId: task.createdBy.id 
          })}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Message</Text>
        </Pressable>

        <Pressable 
          style={[styles.button, styles.bidButton]}
          onPress={() => {
            // TODO: Implement bid submission
            console.log('Submit bid');
          }}
        >
          <Ionicons name="cash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Make an Offer</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  budget: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    padding: 16,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  userJoined: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  messageButton: {
    backgroundColor: '#4F46E5',
  },
  bidButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
