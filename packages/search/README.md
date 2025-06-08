# Gofer Search Service

The search service for the Gofer platform, providing task search functionality using OpenSearch.

## Technology Stack

- TypeScript
- OpenSearch
- AWS SDK
- AWS CDK (for infrastructure)

## Prerequisites

- Node.js v18+
- pnpm v8+
- OpenSearch (local or AWS)
- AWS CLI configured (for deployment)

## Configuration

Copy `.env.template` to `.env` and configure the following variables:

```bash
# OpenSearch Configuration
OPENSEARCH_DOMAIN_ENDPOINT=http://localhost:9200
OPENSEARCH_MASTER_USER=admin
OPENSEARCH_MASTER_PASSWORD=admin
OPENSEARCH_INDEX_PREFIX=local

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default

# Performance & Resilience
MAX_CONNECTIONS=10
CONNECTION_TIMEOUT=5000
REQUEST_TIMEOUT=30000
RETRY_COUNT=3
BULK_SIZE=100

# Monitoring
ENABLE_DEBUG_LOGGING=true
APM_SERVICE_NAME=gofer-search-local
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

3. Run in development mode:
   ```bash
   pnpm dev
   ```

## Infrastructure Deployment

1. Configure AWS credentials
2. Deploy the OpenSearch domain:
   ```bash
   cd ../../scripts
   ./deploy-search.sh
   ```

## Index Schema

The search service uses the following index schema for tasks:

```typescript
{
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
  // ... other fields
}
```

## Testing

```bash
pnpm test        # Run tests
pnpm test:watch  # Run tests in watch mode
pnpm lint        # Run linter
```

## Directory Structure

- `src/`
  - `index.ts` - Main entry point
  - `schema.ts` - Index schema definitions
  - `searchService.ts` - Search service implementation
  - `types.ts` - TypeScript type definitions

## Environment-Specific Configuration

The service supports different environments through environment-specific config files:

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

## Contributing

See the main project README for contribution guidelines.
