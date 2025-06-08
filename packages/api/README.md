# Gofer API Service

The backend API service for the Gofer platform.

## Technology Stack

- Node.js & Express
- TypeScript
- MongoDB
- OpenSearch integration
- AWS Lambda & API Gateway
- Stripe & PayPal payment processing

## Prerequisites

- Node.js v18+
- pnpm v8+
- MongoDB running locally
- OpenSearch running locally (or accessible instance)
- AWS CLI configured (for deployment)

## Configuration

Copy `.env.template` to `.env` and configure the following variables:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gofer

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Search Service Integration
SEARCH_SERVICE_URL=http://localhost:9200
SEARCH_INDEX_PREFIX=local
```

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Initialize search indices (first time only):
   ```bash
   pnpm initialize-search
   ```

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking status

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Payment webhook handler

## Testing

```bash
pnpm test        # Run tests
pnpm test:watch  # Run tests in watch mode
pnpm lint        # Run linter
```

## Directory Structure

- `src/`
  - `functions/` - AWS Lambda functions
  - `routes/` - API route handlers
  - `services/` - Business logic
  - `models/` - Database models
  - `middleware/` - Express middleware
  - `utils/` - Utility functions
- `scripts/` - Utility scripts

## Deployment

1. Configure AWS credentials
2. Update environment variables for target environment
3. Deploy:
   ```bash
   pnpm deploy
   ```

## PayPal Integration Testing

## Prerequisites

1. PayPal Business Account
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard)
   - Sign up for a business account if you don't have one

2. Sandbox Accounts
   - Create sandbox accounts for testing:
     - A business account (to receive payments)
     - A personal account (to make payments)

3. API Credentials
   - Get your sandbox API credentials from the PayPal Developer Dashboard:
     - Client ID
     - Client Secret

4. Webhook Setup
   - In the PayPal Developer Dashboard:
     - Go to Webhooks
     - Add a new webhook with URL: `https://your-api-domain/payments/paypal-webhook`
     - Copy the Webhook ID

## Configuration

1. Update `.env.development` with your PayPal sandbox credentials:
   ```env
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_MODE=sandbox
   PAYPAL_WEBHOOK_ID=your_webhook_id
   ```

2. For local testing with webhooks:
   - Use a service like ngrok to expose your local server:
     ```bash
     ngrok http 3000
     ```
   - Update the webhook URL in PayPal Developer Dashboard with your ngrok URL

## Running Tests

1. Start the API server:
   ```bash
   pnpm dev
   ```

2. In a new terminal, run the PayPal integration test:
   ```bash
   pnpm test:paypal
   ```

## Test Scenarios

The test script (`scripts/test-paypal.ts`) covers:
1. Creating a PayPal payment method
2. Creating a payment intent
3. Confirming the payment

### Manual Testing

1. Open the Gofer mobile or web app
2. Create a new task
3. Try booking the task with PayPal
4. Use your sandbox personal account credentials to complete the payment
5. Check the API logs for webhook events

## Troubleshooting

1. Invalid Credentials
   - Double-check your sandbox credentials in `.env.development`
   - Ensure you're using sandbox (not live) credentials

2. Webhook Issues
   - Verify your ngrok tunnel is running
   - Check the webhook URL in PayPal Developer Dashboard
   - Look for webhook verification errors in the API logs

3. Payment Failures
   - Ensure your sandbox accounts have sufficient test funds
   - Check the PayPal sandbox dashboard for transaction details
   - Review the API logs for error messages

## Going to Production

1. Update `.env.production` with live credentials
2. Set `PAYPAL_MODE=live`
3. Update the webhook URL to your production API endpoint
4. Test thoroughly with real accounts before processing actual payments
