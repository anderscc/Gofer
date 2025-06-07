import { z } from 'zod';

// Base schemas for reuse
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(1),
});

export const MoneySchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'JMD', 'BSD']), // Supporting Jamaica and Bahamas currencies
});

// Task related schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  category: z.enum([
    'CLEANING',
    'DELIVERY',
    'HANDYMAN',
    'MOVING',
    'ERRANDS',
    'OTHER'
  ]),
  budget: MoneySchema,
  location: LocationSchema,
  dueDate: z.date().optional(),
  images: z.array(z.string().url()).optional(),
});

export const TaskBidSchema = z.object({
  taskId: z.string().uuid(),
  amount: z.number().positive(),
  message: z.string().max(500).optional(),
});

// Types derived from schemas
export type Location = z.infer<typeof LocationSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type TaskBidInput = z.infer<typeof TaskBidSchema>;

// API response types
export interface Task extends CreateTaskInput {
  id: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  bids: TaskBid[];
}

export interface TaskBid extends TaskBidInput {
  id: string;
  bidderId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}
