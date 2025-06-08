#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

# Function to print status
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to validate environment
validate_env() {
    print_status "Validating environment..."
    pnpm validate-env
    if [ $? -ne 0 ]; then
        echo -e "${RED}Environment validation failed${NC}"
        exit 1
    fi
}

# Function to build all packages and applications
build_all() {
    print_status "Building shared packages..."
    pnpm build:packages
    if [ $? -ne 0 ]; then
        echo -e "${RED}Package build failed${NC}"
        exit 1
    fi

    print_status "Building web application..."
    pnpm build:web
    if [ $? -ne 0 ]; then
        echo -e "${RED}Web application build failed${NC}"
        exit 1
    fi
}

# Function to deploy search infrastructure
deploy_search() {
    print_status "Deploying search infrastructure..."
    ./scripts/deploy-search.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Search infrastructure deployment failed${NC}"
        exit 1
    fi
}

# Function to deploy API
deploy_api() {
    print_status "Deploying API..."
    (cd packages/api && pnpm deploy)
    if [ $? -ne 0 ]; then
        echo -e "${RED}API deployment failed${NC}"
        exit 1
    fi
}

# Function to deploy web application
deploy_web() {
    print_status "Deploying web application..."
    # Add your web deployment command here based on your hosting platform
    # For example, if using Vercel:
    # vercel --prod
    echo -e "${YELLOW}Warning: Web deployment command needs to be configured based on your hosting platform${NC}"
}

# Main execution
main() {
    local env=$1
    
    if [ -z "$env" ]; then
        echo -e "${RED}Error: Environment must be specified${NC}"
        echo "Usage: ./deploy.sh <environment>"
        echo "Environments: staging, prod"
        exit 1
    fi
    
    # Switch to specified environment
    print_status "Switching to $env environment..."
    ./scripts/switch-env.sh "$env"
    
    validate_env
    build_all
    
    # Setup security groups if needed
    print_status "Setting up security groups..."
    ./scripts/setup-security-groups.sh
    
    deploy_search
    deploy_api
    deploy_web
    
    print_status "Deployment to $env completed successfully!"
}

# Show usage if --help flag is used
if [ "$1" == "--help" ]; then
    echo "Usage: ./deploy.sh <environment>"
    echo ""
    echo "Environments:"
    echo "  staging  - Deploy to staging environment"
    echo "  prod     - Deploy to production environment"
    exit 0
fi

main "$1"
