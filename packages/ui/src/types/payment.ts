export type PaymentMethodType = 'STRIPE' | 'PAYPAL';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

export interface PaymentMethodInput {
  type: PaymentMethodType;
  data: StripePaymentMethodData | PayPalPaymentMethodData;
}

export interface StripePaymentMethodData {
  card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
  email: string;
}

export interface PayPalPaymentMethodData {
  paypalEmail: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string | null;
  paypalOrderId?: string;
  status?: string;
}

export interface PaymentConfirmation {
  status: 'succeeded' | 'failed';
  error?: string;
  paypalPayerId?: string;
}
