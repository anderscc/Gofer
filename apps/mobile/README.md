# Gofer Mobile Application

The mobile client for the Gofer platform built with React Native and Expo.

## Technology Stack

- React Native (via Expo)
- TypeScript
- @gofer/ui (Shared UI components)
- @gofer/auth (Authentication)
- @gofer/api-client (API integration)
- React Native Maps
- Stripe React Native

## Prerequisites

- Node.js v18+
- pnpm v8+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for macOS) or Android Emulator
- Xcode (for iOS development)
- Android Studio (for Android development)

## Configuration

Copy `.env.template` to `.env` and configure the following variables:

```bash
# API Configuration
API_URL=http://localhost:3001

# Authentication
AUTH_DOMAIN=your-auth-domain
AUTH_CLIENT_ID=your-auth-client-id

# External Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Feature Flags
ENABLE_MAPS=true
ENABLE_PAYMENTS=true

# App Configuration
APP_ENV=development
ENABLE_DEBUG_LOGGING=true
```

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open in simulator/emulator:
   ```bash
   # For iOS
   pnpm ios
   
   # For Android
   pnpm android
   ```

## Building for Production

1. Configure app.json with your app details
2. Build for the desired platform:
   ```bash
   # For iOS
   eas build --platform ios
   
   # For Android
   eas build --platform android
   ```

## Testing

```bash
pnpm test        # Run tests
pnpm test:watch  # Run tests in watch mode
pnpm lint        # Run linter
```

## Directory Structure

- `src/`
  - `screens/` - Screen components
  - `components/` - Local components
  - `navigation/` - Navigation configuration
  - `services/` - API and other services
  - `hooks/` - Custom React hooks
  - `utils/` - Utility functions
- `assets/` - Static assets and images

## Debugging

1. Install React Native Debugger
2. Start the debugger
3. In your app, shake the device or press Cmd+D (iOS) / Ctrl+M (Android)
4. Select "Debug Remote JS"

## Contributing

See the main project README for contribution guidelines.
