# PayPal Integration Testing Guide

This guide explains how to test the PayPal integration in sandbox mode.

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
