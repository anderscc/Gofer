import type { Task } from '@gofer/api-client';

export interface SearchParams {
  query?: string;
  category?: string;
  status?: string;
  location?: {
    lat: number;
    lon: number;
    radius: number; // in kilometers
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  sortBy?: 'distance' | 'recent' | 'budget_low' | 'budget_high';
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TaskSearchResult {
  id: string;
  score: number;
  task: Task;
  distance?: number; // in kilometers
}

export interface TaskSuggestion {
  text: string;
  category?: string;
  count: number;
}
