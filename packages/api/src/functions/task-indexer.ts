import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { SearchService } from '@gofer/search';

const dynamodb = new DynamoDB.DocumentClient();
const searchService = new SearchService({
  node: process.env.OPENSEARCH_DOMAIN_ENDPOINT!,
  auth: {
    username: process.env.OPENSEARCH_MASTER_USER!,
    password: process.env.OPENSEARCH_MASTER_PASSWORD!,
  },
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Initialize search service
    await searchService.initialize();

    if (event.Records) {
      // Handle DynamoDB Stream events
      for (const record of event.Records) {
        if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
          // Get the task from the stream
          const task = DynamoDB.Converter.unmarshall(record.dynamodb!.NewImage!);
          
          // Index the task
          await searchService.indexTask(task);
          
          console.log(`Indexed task ${task.id}`);
        } else if (record.eventName === 'REMOVE') {
          // Get the task ID from the stream
          const taskId = record.dynamodb!.Keys!.id.S!;
          
          // Delete the task from the search index
          await searchService.deleteTask(taskId);
          
          console.log(`Deleted task ${taskId} from index`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tasks indexed successfully' }),
    };
  } catch (error) {
    console.error('Error indexing tasks:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to index tasks' }),
    };
  }
};
