import { Client } from '@opensearch-project/opensearch';
import type { Task } from '@gofer/api-client';
import { TASK_INDEX, TASK_MAPPINGS } from './schema';

export interface SearchParams {
  query?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: {
    lat: number;
    lon: number;
    radius: number; // in kilometers
  };
  status?: string[];
  fromDate?: Date;
  toDate?: Date;
  sortBy?: 'relevance' | 'date' | 'budget' | 'distance';
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

export class SearchService {
  private client: Client;

  constructor(config: { node: string; auth?: { username: string; password: string } }) {
    this.client = new Client({
      ...config,
      ssl: { rejectUnauthorized: false } // For development only, remove in production
    });
  }

  async initialize(): Promise<void> {
    const indexExists = await this.client.indices.exists({ index: TASK_INDEX });
    
    if (!indexExists.body) {
      await this.client.indices.create({
        index: TASK_INDEX,
        body: TASK_MAPPINGS
      });
    }
  }

  async indexTask(task: Task): Promise<void> {
    const document = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      budget: task.budget,
      location: {
        lat: task.location.latitude,
        lon: task.location.longitude
      },
      address: task.location.address,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      dueDate: task.dueDate,
      images: task.images,
      // Extract keywords for better search
      tags: [
        task.category.toLowerCase(),
        ...task.title.toLowerCase().split(' '),
        ...task.description.toLowerCase().split(' ')
      ]
    };

    await this.client.index({
      index: TASK_INDEX,
      id: task.id,
      body: document,
      refresh: true // Ensure the document is immediately searchable
    });
  }

  async searchTasks(params: SearchParams): Promise<SearchResult<Task>> {
    const {
      query,
      category,
      minBudget,
      maxBudget,
      location,
      status,
      fromDate,
      toDate,
      sortBy = 'relevance',
      page = 1,
      pageSize = 20
    } = params;

    const must: any[] = [];
    const filter: any[] = [];

    // Full-text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description^2', 'tags'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Category filter
    if (category) {
      filter.push({ term: { category } });
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      filter.push({
        range: {
          'budget.amount': {
            ...(minBudget && { gte: minBudget }),
            ...(maxBudget && { lte: maxBudget })
          }
        }
      });
    }

    // Status filter
    if (status && status.length > 0) {
      filter.push({ terms: { status } });
    }

    // Date range filter
    if (fromDate || toDate) {
      filter.push({
        range: {
          createdAt: {
            ...(fromDate && { gte: fromDate.toISOString() }),
            ...(toDate && { lte: toDate.toISOString() })
          }
        }
      });
    }

    // Location filter with geo distance
    if (location) {
      filter.push({
        geo_distance: {
          distance: `${location.radius}km`,
          location: {
            lat: location.lat,
            lon: location.lon
          }
        }
      });
    }

    // Sorting
    const sort: any[] = [];
    switch (sortBy) {
      case 'date':
        sort.push({ createdAt: 'desc' });
        break;
      case 'budget':
        sort.push({ 'budget.amount': 'desc' });
        break;
      case 'distance':
        if (location) {
          sort.push({
            _geo_distance: {
              location: {
                lat: location.lat,
                lon: location.lon
              },
              order: 'asc',
              unit: 'km'
            }
          });
        }
        break;
      case 'relevance':
      default:
        if (!query) {
          sort.push({ createdAt: 'desc' }); // Default to date if no query
        }
        break;
    }

    const response = await this.client.search({
      index: TASK_INDEX,
      body: {
        query: {
          bool: {
            must,
            filter
          }
        },
        sort,
        from: (page - 1) * pageSize,
        size: pageSize
      }
    });

    const hits = response.body.hits.hits;
    const total = response.body.hits.total.value;

    const tasks = hits.map((hit: any) => ({
      ...hit._source,
      location: {
        latitude: hit._source.location.lat,
        longitude: hit._source.location.lon,
        address: hit._source.address
      }
    }));

    return {
      items: tasks,
      total,
      page,
      pageSize,
      hasMore: total > page * pageSize
    };
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete({
      index: TASK_INDEX,
      id: taskId
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const doc = {
      ...updates,
      ...(updates.location && {
        location: {
          lat: updates.location.latitude,
          lon: updates.location.longitude
        },
        address: updates.location.address
      })
    };

    await this.client.update({
      index: TASK_INDEX,
      id: taskId,
      body: {
        doc,
        doc_as_upsert: true
      }
    });
  }

  async suggestTasks(query: string): Promise<string[]> {
    const response = await this.client.search({
      index: TASK_INDEX,
      body: {
        suggest: {
          titles: {
            prefix: query.toLowerCase(),
            completion: {
              field: 'title.keyword',
              size: 5
            }
          }
        }
      }
    });

    return response.body.suggest.titles[0].options.map((option: any) => option.text);
  }
}
