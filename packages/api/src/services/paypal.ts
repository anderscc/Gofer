import paypal from '@paypal/checkout-server-sdk';

// Initialize PayPal environment
let client: paypal.core.PayPalHttpClient;

function getPayPalClient() {
  if (client) return client;

  const env = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      );

  client = new paypal.core.PayPalHttpClient(env);
  return client;
}

// Create PayPal order
export async function createPayPalOrder(input: {
  amount: number;
  currency: string;
  taskId: string;
}) {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: input.currency.toUpperCase(),
          value: input.amount.toFixed(2)
        },
        custom_id: input.taskId
      }]
    });

    const response = await getPayPalClient().execute(request);
    return {
      id: response.result.id,
      status: response.result.status,
      links: response.result.links
    };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw new Error('Failed to create PayPal order');
  }
}

// Capture PayPal payment
export async function capturePayPalPayment(orderId: string) {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    
    const response = await getPayPalClient().execute(request);
    return {
      id: response.result.id,
      status: response.result.status,
      payer: response.result.payer
    };
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw new Error('Failed to capture PayPal payment');
  }
}

// Verify PayPal webhook signature
export async function verifyPayPalWebhook(headers: Record<string, string>, body: string) {
  try {
    const request = new paypal.notifications.VerifyWebhookSignatureRequest();
    request.requestBody({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body)
    });

    const response = await getPayPalClient().execute(request);
    return response.result.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error);
    return false;
  }
}
