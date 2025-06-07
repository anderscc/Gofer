export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  rating?: number;
  tasksCompleted?: number;
  joinedDate: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  budget: {
    amount: number;
    currency: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdBy: User;
  assignedTo?: User;
  createdAt: Date;
  dueDate?: Date;
  images?: string[];
}

export enum TaskCategory {
  CLEANING = 'CLEANING',
  DELIVERY = 'DELIVERY',
  HANDYMAN = 'HANDYMAN',
  MOVING = 'MOVING',
  ERRANDS = 'ERRANDS',
  OTHER = 'OTHER',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Bid {
  id: string;
  taskId: string;
  bidder: User;
  amount: number;
  currency: string;
  message?: string;
  createdAt: Date;
  status: BidStatus;
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  taskId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
}
