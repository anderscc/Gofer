import { Client } from '@opensearch-project/opensearch';
import type { Task } from '@gofer/api-client';

const TASK_INDEX = 'tasks';
const TASK_MAPPINGS = {
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: { 
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      description: { 
        type: 'text',
        analyzer: 'standard'
      },
      category: { type: 'keyword' },
      status: { type: 'keyword' },
      budget: {
        properties: {
          amount: { type: 'float' },
          currency: { type: 'keyword' }
        }
      },
      location: {
        type: 'geo_point'
      },
      address: { type: 'text' },
      createdBy: { type: 'keyword' },
      assignedTo: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      dueDate: { type: 'date' },
      images: { type: 'keyword' },
      tags: { type: 'keyword' }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        standard: {
          type: 'standard',
          stopwords: '_english_'
        }
      }
    }
  }
};
