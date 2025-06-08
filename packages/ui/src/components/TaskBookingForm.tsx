import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';
import type { Task } from '../types';
import type { PaymentMethod } from '../types/payment';
import { colors, spacing, typography } from '../theme';

export interface TaskBookingFormProps {
  task: Task;
  onSubmit: (data: {
    taskId: string;
    bidId?: string;
    paymentMethod: {
      type: 'STRIPE' | 'PAYPAL';
      id: string;
    };
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function TaskBookingForm({ task, onSubmit, isLoading }: TaskBookingFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const [notes, setNotes] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>();
  
  // Card input fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [email, setEmail] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  useEffect(() => {
    loadSavedPaymentMethods();
  }, []);

  const loadSavedPaymentMethods = async () => {
    try {
      // Mock data for now - in production this would come from the API
      const methods: PaymentMethod[] = [];
      setSavedPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const handleAddCard = async () => {
    try {
      if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !email) {
        Alert.alert('Missing Information', 'Please fill in all card details');
        return;
      }

      // Mock payment method creation - in production this would use Stripe SDK
      const paymentMethod: PaymentMethod = {
        id: `card-${Date.now()}`,
        type: 'STRIPE',
        last4: cardNumber.slice(-4),
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        email,
        isDefault: savedPaymentMethods.length === 0,
      };

      setSavedPaymentMethods([...savedPaymentMethods, paymentMethod]);
      setSelectedPaymentMethodId(paymentMethod.id);
      
      // Clear form
      setCardNumber('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvc('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add card. Please try again.');
    }
  };

  const handleAddPayPal = async () => {
    try {
      if (!paypalEmail) {
        Alert.alert('Missing Information', 'Please enter your PayPal email');
        return;
      }

      // Create PayPal payment method
      const paymentMethod: PaymentMethod = {
        id: `pp_${Date.now()}`,
        type: 'PAYPAL',
        email: paypalEmail,
        isDefault: savedPaymentMethods.length === 0,
      };

      setSavedPaymentMethods([...savedPaymentMethods, paymentMethod]);
      setSelectedPaymentMethodId(paymentMethod.id);
      setPaypalEmail('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add PayPal account. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedPaymentMethodId) {
        Alert.alert('Payment Method Required', 'Please select or add a payment method');
        return;
      }

      await onSubmit({
        taskId: task.id,
        paymentMethod: {
          type: selectedPaymentMethod,
          id: selectedPaymentMethodId,
        },
        notes,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  return (
    <Card title="Book this Task">
      <View style={styles.field}>
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentMethods}>
          <View style={styles.paymentButton}>
            <Button
              variant={selectedPaymentMethod === 'STRIPE' ? 'primary' : 'outline'}
              onPress={() => setSelectedPaymentMethod('STRIPE')}
              fullWidth
            >
              Credit Card
            </Button>
          </View>
          <View style={styles.paymentButton}>
            <Button
              variant={selectedPaymentMethod === 'PAYPAL' ? 'primary' : 'outline'}
              onPress={() => setSelectedPaymentMethod('PAYPAL')}
              fullWidth
            >
              PayPal
            </Button>
          </View>
        </View>
      </View>

      {selectedPaymentMethod === 'STRIPE' && (
        <>
          {savedPaymentMethods.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Saved Cards</Text>
              <View style={styles.savedCards}>
                {savedPaymentMethods
                  .filter((method) => method.type === 'STRIPE')
                  .map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethodId === method.id ? 'primary' : 'outline'}
                      onPress={() => setSelectedPaymentMethodId(method.id)}
                      fullWidth
                    >
                      {`Card ending in ${method.last4}`}
                    </Button>
                  ))}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Add New Card</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="number-pad"
              maxLength={16}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="MM"
                value={expiryMonth}
                onChangeText={setExpiryMonth}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="YY"
                value={expiryYear}
                onChangeText={setExpiryYear}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="CVC"
                value={cvc}
                onChangeText={setCvc}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              variant="outline"
              onPress={handleAddCard}
              fullWidth
              isLoading={isLoading}
            >
              Add Card
            </Button>
          </View>
        </>
      )}

      {selectedPaymentMethod === 'PAYPAL' && (
        <>
          {savedPaymentMethods.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Saved PayPal Accounts</Text>
              <View style={styles.savedPayPal}>
                {savedPaymentMethods
                  .filter((method) => method.type === 'PAYPAL')
                  .map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethodId === method.id ? 'primary' : 'outline'}
                      onPress={() => setSelectedPaymentMethodId(method.id)}
                      fullWidth
                    >
                      {method.email}
                    </Button>
                  ))}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Add PayPal Account</Text>
            <TextInput
              style={styles.input}
              placeholder="PayPal Email"
              value={paypalEmail}
              onChangeText={setPaypalEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              variant="outline"
              onPress={handleAddPayPal}
              fullWidth
              isLoading={isLoading}
            >
              Add PayPal Account
            </Button>
          </View>
        </>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any special instructions or notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <Button
        variant="primary"
        onPress={handleSubmit}
        fullWidth
        isLoading={isLoading}
      >
        {`Confirm Booking (${task.budget.currency} ${task.budget.amount.toFixed(2)})`}
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: '500',
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  savedCards: {
    gap: spacing.sm,
  },
  savedPayPal: {
    gap: spacing.sm,
  },
});
