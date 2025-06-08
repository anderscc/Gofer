import axios, { AxiosInstance } from 'axios';
import type { Booking, CreateBookingInput } from '../types/booking';
import { BookingSchema } from '../types/booking';
import type { CreatePaymentIntentInput } from './payments';

export class BookingsApi {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    // Validate input before sending to API
    const validatedInput = BookingSchema.parse(input);

    const response = await this.client.post<Booking>('/bookings', validatedInput);
    return response.data;
  }

  async getBooking(bookingId: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`/bookings/${bookingId}`);
    return response.data;
  }

  async getUserBookings(params?: {
    status?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ items: Booking[]; total: number }> {
    const response = await this.client.get<{ items: Booking[]; total: number }>('/bookings', {
      params,
    });
    return response.data;
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${bookingId}/complete`);
    return response.data;
  }
}
