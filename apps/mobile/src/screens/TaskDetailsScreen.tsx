import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TaskBookingForm } from '@gofer/ui';
import { BookingsApi, PaymentsApi } from '@gofer/api-client';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

export function TaskDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { task } = route.params;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const bookingsApi = new BookingsApi(process.env.EXPO_PUBLIC_API_URL || '');
  const paymentsApi = new PaymentsApi(process.env.EXPO_PUBLIC_API_URL || '');

  const handleBooking = async (data: {
    taskId: string;
    bidId?: string;
    paymentMethod: {
      type: 'STRIPE' | 'PAYPAL';
      id: string;
    };
    notes?: string;
  }) => {
    try {
      setIsBooking(true);

      // Create payment intent
      const paymentIntent = await paymentsApi.createPaymentIntent({
        amount: task.budget.amount,
        currency: task.budget.currency,
        paymentMethodId: data.paymentMethod.id,
        taskId: task.id
      });

      // Create booking with payment intent
      const booking = await bookingsApi.createBooking({
        ...data,
        taskId: task.id,
        paymentIntentId: paymentIntent.id
      });

      // Confirm payment
      const confirmResult = await paymentsApi.confirmPayment(paymentIntent.id);
      
      if (confirmResult.status === 'failed') {
        throw new Error(`Payment failed: ${confirmResult.error || 'Unknown error'}`);
      }
      
      setShowBookingModal(false);
      Alert.alert(
        'Booking Confirmed',
        'Your task has been successfully booked. You can view the details in your bookings.',
        [
          { 
            text: 'View Bookings', 
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: 'MainTabs',
                    params: { screen: 'MyTasks' }
                  }
                ]
              });
            }
          },
          { 
            text: 'Continue Browsing',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'There was an error booking the task. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error booking task:', error.message);
        if (error.message.includes('payment')) {
          errorMessage = 'Payment failed. Please check your payment details and try again.';
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'This task is no longer available.';
        }
      }

      Alert.alert(
        'Booking Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
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
            onPress={() => setShowBookingModal(true)}
          >
            <Ionicons name="cash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Book Now</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowBookingModal(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </Pressable>
            <TaskBookingForm
              task={task}
              onSubmit={handleBooking}
              isLoading={isBooking}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
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
  }
});
