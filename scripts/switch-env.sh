#!/bin/zsh

# Check if environment argument is provided
ENV=$1
if [ -z "$ENV" ]; then
  echo "Usage: ./switch-env.sh [development|staging|production]"
  exit 1
fi

# Validate environment name
if [[ ! "$ENV" =~ ^(development|staging|production)$ ]]; then
  echo "Invalid environment. Must be one of: development, staging, production"
  exit 1
fi

echo "Switching to $ENV environment..."

# List of all packages and apps that need environment configuration
COMPONENTS=(
  "apps/mobile"
  "apps/web"
  "packages/api"
  "packages/search"
)

# Switch environment files for each component
for component in "${COMPONENTS[@]}"; do
  if [ -f "$component/.env.$ENV" ]; then
    echo "Setting up environment for $component..."
    cp "$component/.env.$ENV" "$component/.env"
  else
    echo "Warning: No environment file found for $component in $ENV environment"
  fi
done

# Update root environment file
if [ -f ".env.$ENV" ]; then
  cp ".env.$ENV" ".env"
fi

# Run environment-specific setup if needed
case $ENV in
  "development")
    echo "Setting up development environment..."
    # Start local OpenSearch if needed
    docker-compose up -d opensearch
    ;;
  "staging")
    echo "Setting up staging environment..."
    # Additional staging setup
    ;;
  "production")
    echo "Setting up production environment..."
    # Additional production setup
    ;;
esac

echo "Validating environment configuration..."
ts-node scripts/validate-env.ts
if [ $? -eq 0 ]; then
  echo "✅ Environment switch complete!"
else
  echo "❌ Environment validation failed. Please check the error messages above and fix any issues."
  exit 1
fi
