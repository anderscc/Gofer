import { config } from 'dotenv';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { SearchService } from '@gofer/search';

config();

async function initializeSearch() {
  const dynamodb = new DynamoDB({
    region: process.env.AWS_REGION
  });

  const searchService = new SearchService({
    node: process.env.OPENSEARCH_DOMAIN_ENDPOINT!,
    auth: {
      username: process.env.OPENSEARCH_MASTER_USER!,
      password: process.env.OPENSEARCH_MASTER_PASSWORD!
    }
  });

  try {
    // Initialize the search index
    console.log('Initializing search index...');
    await searchService.initialize();

    // Scan all tasks from DynamoDB
    console.log('Scanning tasks from DynamoDB...');
    const { Items = [] } = await dynamodb.scan({
      TableName: process.env.TASKS_TABLE_NAME!
    });

    // Index all tasks
    console.log(`Indexing ${Items.length} tasks...`);
    for (const item of Items) {
      const task = unmarshall(item);
      await searchService.indexTask(task);
      console.log(`Indexed task ${task.id}`);
    }

    console.log('Search initialization complete!');
  } catch (error) {
    console.error('Error initializing search:', error);
    process.exit(1);
  }
}

initializeSearch();
