# Gofer

A full-stack task management and booking platform.

## Project Structure

```
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile application
├── packages/
│   ├── api/          # Backend API service
│   ├── api-client/   # Shared API client library
│   ├── auth/         # Authentication package
│   ├── infra/        # Infrastructure as code
│   ├── search/       # Search service
│   └── ui/           # Shared UI components
└── scripts/          # Development and deployment scripts
```

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- MongoDB
- OpenSearch (for search functionality)
- AWS CLI (for deployment)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gofer.git
   cd gofer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.template` files to `.env` in each project:
     ```bash
     find . -name ".env.template" -exec sh -c 'cp "$1" "${1%.template}"' _ {} \;
     ```
   - Update the `.env` files with your configuration values

4. Start the development environment:
   ```bash
   ./scripts/dev.sh
   ```

## Development Scripts

- `./scripts/dev.sh`: Start local development environment
- `./scripts/deploy.sh`: Deploy to staging/production
- `./scripts/switch-env.sh`: Switch between environments
- `./scripts/validate-env.ts`: Validate environment variables

## Available Commands

- `pnpm dev:web`: Start web application
- `pnpm dev:mobile`: Start mobile application
- `pnpm build:web`: Build web application
- `pnpm build:mobile`: Build mobile application
- `pnpm build:packages`: Build shared packages
- `pnpm test`: Run tests
- `pnpm lint`: Run linter

## Environment Configuration

Each component (web, mobile, api, search) has its own environment configuration. Check the respective `.env.template` files for required variables.

## Deployment

1. Configure AWS credentials
2. Update environment-specific variables
3. Run deployment script:
   ```bash
   ./scripts/deploy.sh [environment]
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[Your License Here]