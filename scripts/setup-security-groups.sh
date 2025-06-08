#!/bin/zsh

# Load environment variables
source .env

# Set variables
STACK_NAME="gofer-security-groups"
TEMPLATE_FILE="packages/infra/templates/security-groups.yaml"

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file $TEMPLATE_FILE \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    VpcId=$VPC_ID \
  --capabilities CAPABILITY_IAM \
  --tags \
    Environment=production \
    Project=gofer

# Get the security group IDs
OPENSEARCH_SG=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`OpenSearchSecurityGroupId`].OutputValue' \
  --output text)

LAMBDA_SG=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`LambdaSecurityGroupId`].OutputValue' \
  --output text)

# Update environment files
echo "Updating environment files with security group IDs..."

# Update search package environment
sed -i '' "s/^SECURITY_GROUP_ID=.*/SECURITY_GROUP_ID=$OPENSEARCH_SG/" packages/search/.env

# Update API package environment
sed -i '' "s/^LAMBDA_TASK_INDEXER_SECURITY_GROUP_ID=.*/LAMBDA_TASK_INDEXER_SECURITY_GROUP_ID=$LAMBDA_SG/" packages/api/.env

echo "Security groups have been created and configured:"
echo "OpenSearch Security Group: $OPENSEARCH_SG"
echo "Lambda Security Group: $LAMBDA_SG"
