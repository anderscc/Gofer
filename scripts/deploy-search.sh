#!/bin/zsh

# Build the packages
echo "Building packages..."
pnpm run build

# Deploy infrastructure
echo "Deploying infrastructure..."
cd packages/infra
cdk deploy "*" --require-approval never

# Get the outputs
DOMAIN_ENDPOINT=$(aws cloudformation describe-stacks --stack-name GoferSearchStack --query 'Stacks[0].Outputs[?OutputKey==`OpenSearchDomainEndpoint`].OutputValue' --output text)
DOMAIN_NAME=$(aws cloudformation describe-stacks --stack-name GoferSearchStack --query 'Stacks[0].Outputs[?OutputKey==`OpenSearchDomainName`].OutputValue' --output text)
SEARCH_ROLE_ARN=$(aws cloudformation describe-stacks --stack-name GoferSearchStack --query 'Stacks[0].Outputs[?OutputKey==`SearchRoleArn`].OutputValue' --output text)

# Update environment files
echo "Updating environment files..."

# Update mobile app environment
cat > ../../apps/mobile/.env << EOL
OPENSEARCH_DOMAIN_ENDPOINT=${DOMAIN_ENDPOINT}
OPENSEARCH_MASTER_USER=admin
EOL

# Update API environment
cat > ../../packages/api/.env << EOL
OPENSEARCH_DOMAIN_ENDPOINT=${DOMAIN_ENDPOINT}
OPENSEARCH_MASTER_USER=admin
LAMBDA_TASK_INDEXER_ROLE_ARN=${SEARCH_ROLE_ARN}
EOL

echo "Deployment complete!"
echo "OpenSearch Domain Endpoint: ${DOMAIN_ENDPOINT}"
echo "OpenSearch Domain Name: ${DOMAIN_NAME}"
echo "Search Role ARN: ${SEARCH_ROLE_ARN}"

# Initialize the search index
echo "Initializing search index..."
cd ../../packages/api
pnpm run initialize-search

echo "Setup complete!"
