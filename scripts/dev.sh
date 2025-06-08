#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
YELLOW='\033[1;33m'

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists pnpm; then
        echo -e "${RED}Error: pnpm is not installed. Please install it first.${NC}"
        echo "You can install it using: npm install -g pnpm"
        exit 1
    fi
    
    if ! command_exists node; then
        echo -e "${RED}Error: Node.js is not installed. Please install it first.${NC}"
        exit 1
    fi
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

# Function to build packages
build_packages() {
    print_status "Building shared packages..."
    pnpm build:packages
    if [ $? -ne 0 ]; then
        echo -e "${RED}Package build failed${NC}"
        exit 1
    fi
}

# Function to start development servers
start_dev_servers() {
    print_status "Starting development servers..."
    
    # Start the API server
    print_status "Starting API server..."
    (cd packages/api && pnpm dev) &
    API_PID=$!
    
    # Wait a bit for the API to start
    sleep 2
    
    # Start the web application
    print_status "Starting web application..."
    (cd apps/web && pnpm dev) &
    WEB_PID=$!
    
    # Trap SIGINT (Ctrl+C) to properly close both processes
    trap "kill $API_PID $WEB_PID; exit" SIGINT
    
    # Wait for both processes
    wait
}

# Main execution
main() {
    local env=$1
    
    check_prerequisites
    
    # If environment is specified, switch to it
    if [ ! -z "$env" ]; then
        print_status "Switching to $env environment..."
        ./scripts/switch-env.sh "$env"
    fi
    
    validate_env
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install
    fi
    
    build_packages
    start_dev_servers
}

# Show usage if --help flag is used
if [ "$1" == "--help" ]; then
    echo "Usage: ./dev.sh [environment]"
    echo ""
    echo "Environments:"
    echo "  local    - Local development environment (default)"
    echo "  staging  - Staging environment"
    echo "  prod     - Production environment"
    exit 0
fi

main "$1"
