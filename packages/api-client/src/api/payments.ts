import axios, { AxiosInstance } from 'axios';

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  paymentMethodId: string;
  taskId: string;
}

export interface PaymentMethod {
  id: string;
  type: 'STRIPE' | 'PAYPAL';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

export interface PaymentMethodInput {
  type: 'STRIPE' | 'PAYPAL';
  data: {
    card?: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    };
    paypalEmail?: string;
  };
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string | null;
  paypalOrderId?: string;
  status?: string;
}

export interface PaymentConfirmationResult {
  status: 'succeeded' | 'failed';
  error?: string;
  paypalPayerId?: string;
}

export class PaymentsApi {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethod> {
    const response = await this.client.post<PaymentMethod>('/payments/methods', input);
    return response.data;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await this.client.get<PaymentMethod[]>('/payments/methods');
    return response.data;
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const response = await this.client.post<PaymentIntentResult>('/payments/intent', input);
    return response.data;
  }

  async confirmPayment(paymentIntentId: string, paymentMethod: 'STRIPE' | 'PAYPAL'): Promise<PaymentConfirmationResult> {
    const response = await this.client.post<PaymentConfirmationResult>(
      `/payments/intent/${paymentIntentId}/confirm`,
      { paymentMethod }
    );
    return response.data;
  }
}
