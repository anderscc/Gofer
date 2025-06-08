import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import {
  createStripePaymentMethod,
  createStripePaymentIntent,
  confirmStripePayment,
  handlePayPalPayment,
  createPayPalPaymentIntent,
  confirmPayPalPayment
} from './services/payment';
import { verifyPayPalWebhook } from './services/paypal';
import { handlePayPalWebhook } from './services/webhook-handler';
import type { PaymentMethod } from '../../ui/src/types/payment';
import type { CreatePaymentIntentInput } from '../../api-client/src/api/payments';

// Load environment variables
const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });

const app = express();
app.use(cors());
app.use(express.json());

// Initialize in-memory stores for development
const savedPaymentMethods: any[] = [];

// Payment methods endpoints
app.get('/payments/methods', (req, res) => {
  res.json(savedPaymentMethods);
});

app.post('/payments/methods', async (req, res) => {
  try {
    const input: PaymentMethod = req.body;
    let paymentMethod;

    if (input.type === 'STRIPE') {
      paymentMethod = await createStripePaymentMethod(input);
    } else if (input.type === 'PAYPAL') {
      paymentMethod = await handlePayPalPayment(input);
    } else {
      throw new Error('Unsupported payment method type');
    }

    savedPaymentMethods.push(paymentMethod);
    res.json(paymentMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(400).json({ error: 'Failed to create payment method' });
  }
});

// Payment intent endpoints
app.post('/payments/intent', async (req, res) => {
  try {
    const input: CreatePaymentIntentInput = req.body;

    // Validate input
    if (!input.amount || !input.currency || !input.paymentMethodId || !input.taskId) {
      throw new Error('Missing required payment intent fields');
    }

    // Handle different payment methods
    const paymentMethod = savedPaymentMethods.find(pm => pm.id === input.paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    let result;
    if (paymentMethod.type === 'STRIPE') {
      result = await createStripePaymentIntent(input);
    } else if (paymentMethod.type === 'PAYPAL') {
      result = await createPayPalPaymentIntent(input);
    } else {
      throw new Error('Unsupported payment method type');
    }

    res.json(result);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(400).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/payments/intent/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    let result;
    if (paymentMethod === 'STRIPE') {
      result = await confirmStripePayment(id);
    } else if (paymentMethod === 'PAYPAL') {
      result = await confirmPayPalPayment(id);
    } else {
      throw new Error('Unsupported payment method type');
    }

    res.json(result);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to confirm payment'
    });
  }
});

// PayPal webhook endpoint
app.post('/payments/paypal-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers as Record<string, string>;
  const payload = req.body.toString();

  try {
    const isValid = await verifyPayPalWebhook(signature, payload);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload);
    await handlePayPalWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(400).json({ error: 'Webhook Error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
