import { BookingsApi } from '@gofer/api-client';

export interface WebhookPayload {
  event_type: string;
  resource: {
    id: string;
    status: string;
    custom_id?: string; // This will be our taskId
    purchase_units?: Array<{
      custom_id: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
        }>;
      };
    }>;
  };
}

export async function handlePayPalWebhook(event: WebhookPayload) {
  const bookingsApi = new BookingsApi(process.env.API_URL || '');

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const taskId = event.resource.purchase_units?.[0]?.custom_id;
      if (!taskId) {
        throw new Error('No task ID found in webhook payload');
      }

      await bookingsApi.updateBookingStatus(taskId, {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentDetails: {
          provider: 'PAYPAL',
          transactionId: event.resource.id,
          captureId: event.resource.purchase_units[0].payments?.captures?.[0]?.id
        }
      });
      break;
    }

    case 'PAYMENT.CAPTURE.DENIED':
    case 'PAYMENT.CAPTURE.DECLINED': {
      const taskId = event.resource.purchase_units?.[0]?.custom_id;
      if (!taskId) {
        throw new Error('No task ID found in webhook payload');
      }

      await bookingsApi.updateBookingStatus(taskId, {
        status: 'FAILED',
        paymentStatus: 'FAILED',
        paymentDetails: {
          provider: 'PAYPAL',
          transactionId: event.resource.id,
          error: event.resource.status
        }
      });
      break;
    }

    // Handle other webhook events as needed
    default:
      console.log(`Unhandled PayPal webhook event: ${event.event_type}`);
  }
}
