# Gofer API Client

Shared API client library for the Gofer platform. This package provides type-safe API bindings and utilities for interacting with the Gofer API.

## Installation

```bash
pnpm add @gofer/api-client
```

## Usage

```typescript
import { TasksAPI, BookingsAPI, PaymentsAPI } from '@gofer/api-client';

// Initialize APIs
const tasksApi = new TasksAPI();
const bookingsApi = new BookingsAPI();
const paymentsApi = new PaymentsAPI();

// Fetch tasks
const tasks = await tasksApi.list({
  status: 'OPEN',
  category: 'CLEANING'
});

// Create a booking
const booking = await bookingsApi.create({
  taskId: 'task-123',
  date: new Date(),
  notes: 'Available in the afternoon'
});

// Create payment intent
const intent = await paymentsApi.createIntent({
  amount: 5000, // in cents
  currency: 'USD'
});
```

## API Reference

### Tasks API

```typescript
interface TasksAPI {
  list(params?: TaskListParams): Promise<Task[]>;
  create(data: CreateTaskData): Promise<Task>;
  get(id: string): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}
```

### Bookings API

```typescript
interface BookingsAPI {
  create(data: CreateBookingData): Promise<Booking>;
  get(id: string): Promise<Booking>;
  update(id: string, data: UpdateBookingData): Promise<Booking>;
  listForTask(taskId: string): Promise<Booking[]>;
  listForUser(userId: string): Promise<Booking[]>;
}
```

### Payments API

```typescript
interface PaymentsAPI {
  createIntent(data: CreatePaymentIntentData): Promise<PaymentIntent>;
  confirmPayment(intentId: string): Promise<PaymentConfirmation>;
  listTransactions(userId: string): Promise<Transaction[]>;
}
```

## Configuration

Configure the API client with your environment:

```typescript
import { configureApi } from '@gofer/api-client';

configureApi({
  baseUrl: process.env.API_URL,
  timeout: 5000,
  headers: {
    'x-api-key': process.env.API_KEY
  }
});
```

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the package:
   ```bash
   pnpm build
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

## Directory Structure

- `src/`
  - `api/` - API implementations
  - `types/` - TypeScript type definitions
  - `utils/` - Helper utilities
  - `config.ts` - Configuration
  - `index.ts` - Package entry point

## Error Handling

The API client includes built-in error handling:

```typescript
try {
  await tasksApi.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API-specific errors
    console.error(error.code, error.message);
  }
}
```

## Contributing

See the main project README for contribution guidelines.
