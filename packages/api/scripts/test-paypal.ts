import { PaymentsApi } from '@gofer/api-client';

async function testPayPalIntegration() {
  const paymentsApi = new PaymentsApi('http://localhost:3000');

  try {
    // 1. Create a PayPal payment method
    console.log('Creating PayPal payment method...');
    const paymentMethod = await paymentsApi.createPaymentMethod({
      type: 'PAYPAL',
      data: {
        paypalEmail: 'test-buyer@gofer.com'
      }
    });
    console.log('PayPal payment method created:', paymentMethod);

    // 2. Create a payment intent
    console.log('\nCreating payment intent...');
    const paymentIntent = await paymentsApi.createPaymentIntent({
      amount: 50.00,
      currency: 'USD',
      paymentMethodId: paymentMethod.id,
      taskId: 'test-task-123'
    });
    console.log('Payment intent created:', paymentIntent);

    // 3. Simulate PayPal order confirmation
    console.log('\nConfirming payment...');
    const confirmation = await paymentsApi.confirmPayment(
      paymentIntent.paypalOrderId!,
      'PAYPAL'
    );
    console.log('Payment confirmation:', confirmation);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testPayPalIntegration();
