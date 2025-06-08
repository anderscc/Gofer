import { z } from 'zod';
import type { Task } from './task';

export const PaymentMethodSchema = z.object({
  type: z.enum(['STRIPE', 'PAYPAL']),
  id: z.string()
});

export const BookingSchema = z.object({
  taskId: z.string().uuid(),
  // We'll use the bid ID if there was a bidding process
  bidId: z.string().uuid().optional(),
  // Selected payment method
  paymentMethod: PaymentMethodSchema,
  paymentIntentId: z.string().optional(),
  // Additional booking requirements/notes
  notes: z.string().max(500).optional()
});

export const BookingStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAYMENT_FAILED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED'
]);

// Types derived from schemas
export type CreateBookingInput = z.infer<typeof BookingSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export interface PaymentInfo {
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  refundId?: string;
  paymentMethodId: string;
  paymentMethodType: 'STRIPE' | 'PAYPAL';
  last4?: string;
  cardBrand?: string;
  email?: string;
  error?: string;
}

// API response type
export interface Booking extends CreateBookingInput {
  id: string;
  status: BookingStatus;
  task: Task;
  payment: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}
