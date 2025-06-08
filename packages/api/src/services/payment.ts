import Stripe from 'stripe';
import { CreatePaymentIntentInput, PaymentMethodInput } from '@gofer/api-client';
import { createPayPalOrder, capturePayPalPayment } from './paypal';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

// Create a payment method with Stripe
export async function createStripePaymentMethod(input: PaymentMethodInput) {
  if (input.type !== 'STRIPE' || !input.data.card) {
    throw new Error('Invalid payment method data for Stripe');
  }

  // Create a token with the card details
  const token = await stripe.tokens.create({
    card: {
      number: input.data.card.number,
      exp_month: input.data.card.expMonth,
      exp_year: input.data.card.expYear,
      cvc: input.data.card.cvc,
    },
  });

  // Create a payment method with the token
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: {
      token: token.id,
    },
  });

  return {
    id: paymentMethod.id,
    type: 'STRIPE' as const,
    last4: token.card?.last4,
    expiryMonth: token.card?.exp_month,
    expiryYear: token.card?.exp_year,
    email: input.data.email,
    isDefault: false,
  };
}

// Create a payment intent with Stripe
export async function createStripePaymentIntent(input: CreatePaymentIntentInput) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(input.amount * 100), // Convert to cents
    currency: input.currency.toLowerCase(),
    payment_method: input.paymentMethodId,
    confirm: false,
    setup_future_usage: 'off_session',
    metadata: {
      taskId: input.taskId,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    id: paymentIntent.id,
  };
}

// Confirm a payment intent with Stripe
export async function confirmStripePayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return {
      status: paymentIntent.status === 'succeeded' ? 'succeeded' as const : 'failed' as const,
      error: paymentIntent.last_payment_error?.message,
    };
  } catch (error) {
    return {
      status: 'failed' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Handle PayPal payment
export async function handlePayPalPayment(input: PaymentMethodInput) {
  if (input.type !== 'PAYPAL' || !input.data.paypalEmail) {
    throw new Error('Invalid payment method data for PayPal');
  }

  // For PayPal, we don't need to store a payment method - we'll create orders on demand
  return {
    id: `pp_${Date.now()}`, // Generate a unique ID for the PayPal payment method
    type: 'PAYPAL' as const,
    email: input.data.paypalEmail,
    isDefault: false,
  };
}

// Create PayPal payment intent (order)
export async function createPayPalPaymentIntent(input: CreatePaymentIntentInput) {
  const order = await createPayPalOrder({
    amount: input.amount,
    currency: input.currency,
    taskId: input.taskId,
  });

  return {
    id: order.id,
    clientSecret: null, // PayPal doesn't use client secrets
    paypalOrderId: order.id,
    status: order.status,
  };
}

// Confirm PayPal payment
export async function confirmPayPalPayment(orderId: string) {
  try {
    const result = await capturePayPalPayment(orderId);
    return {
      status: result.status === 'COMPLETED' ? 'succeeded' as const : 'failed' as const,
      paypalPayerId: result.payer?.payer_id,
    };
  } catch (error) {
    return {
      status: 'failed' as const,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
