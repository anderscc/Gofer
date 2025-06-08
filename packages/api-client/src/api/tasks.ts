import axios, { AxiosInstance } from 'axios';
import {
  Task,
  CreateTaskInput,
  TaskBid,
  TaskBidInput,
  CreateTaskSchema,
  TaskBidSchema,
} from '../types/task';
import type { SearchParams, SearchResult } from '@gofer/search';

export class TasksApi {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    // Validate input before sending to API
    const validatedInput = CreateTaskSchema.parse(input);
    
    const response = await this.client.post<Task>('/tasks', validatedInput);
    return response.data;
  }

  async getTasks(params?: {
    category?: string;
    status?: string;
    near?: { lat: number; lng: number; radius: number };
  }): Promise<Task[]> {
    const response = await this.client.get<Task[]>('/tasks', { params });
    return response.data;
  }

  async getTask(taskId: string): Promise<Task> {
    const response = await this.client.get<Task>(`/tasks/${taskId}`);
    return response.data;
  }

  async createBid(input: TaskBidInput): Promise<TaskBid> {
    const validatedInput = TaskBidSchema.parse(input);
    
    const response = await this.client.post<TaskBid>(
      `/tasks/${input.taskId}/bids`,
      validatedInput
    );
    return response.data;
  }

  async uploadTaskImage(taskId: string, file: File | Blob): Promise<string> {
    // Get presigned URL
    const { uploadUrl, imageUrl } = await this.client
      .post<{ uploadUrl: string; imageUrl: string }>(
        `/tasks/${taskId}/image-upload-url`
      )
      .then((res) => res.data);

    // Upload to S3
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return imageUrl;
  }

  async searchTasks(params: SearchParams): Promise<SearchResult<Task>> {
    const response = await this.client.get<SearchResult<Task>>('/tasks/search', { 
      params: {
        ...params,
        fromDate: params.fromDate?.toISOString(),
        toDate: params.toDate?.toISOString(),
      } 
    });
    return response.data;
  }

  async suggestTasks(query: string): Promise<string[]> {
    const response = await this.client.get<string[]>('/tasks/suggest', { 
      params: { query } 
    });
    return response.data;
  }

  async searchNearby(latitude: number, longitude: number, radius: number = 20): Promise<SearchResult<Task>> {
    return this.searchTasks({
      location: {
        lat: latitude,
        lon: longitude,
        radius
      },
      sortBy: 'distance'
    });
  }
}
