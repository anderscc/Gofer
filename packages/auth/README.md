# Gofer Auth Package

Authentication and authorization package for the Gofer platform.

## Features

- User authentication
- JWT handling
- Protected route components
- Authentication context provider
- Social login integration

## Installation

```bash
pnpm add @gofer/auth
```

## Usage

1. Wrap your app with the auth provider:

```tsx
import { AuthProvider } from '@gofer/auth';

function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}
```

2. Use authentication hooks in your components:

```tsx
import { useAuth } from '@gofer/auth';

function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

3. Protect routes:

```tsx
import { ProtectedRoute } from '@gofer/auth';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/public" element={<PublicPage />} />
      <Route
        path="/protected"
        element={
          <ProtectedRoute>
            <ProtectedPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Configuration

The auth package needs to be configured with your authentication provider details:

```typescript
// config.ts
export const authConfig = {
  domain: process.env.AUTH_DOMAIN,
  clientId: process.env.AUTH_CLIENT_ID,
  audience: process.env.AUTH_AUDIENCE,
  scope: 'openid profile email',
};
```

## API Reference

### Hooks

- `useAuth()` - Access authentication context
- `useProtectedRoute()` - Protect routes from unauthorized access
- `useAuthState()` - Access authentication state
- `useUser()` - Access current user information

### Components

- `AuthProvider` - Authentication context provider
- `ProtectedRoute` - Route protection component
- `LoginButton` - Pre-styled login button
- `LogoutButton` - Pre-styled logout button

### Functions

- `signIn(credentials)` - Sign in with credentials
- `signOut()` - Sign out current user
- `signUp(userData)` - Register new user
- `resetPassword(email)` - Initiate password reset
- `verifyEmail(token)` - Verify email address

## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the package:
   ```bash
   pnpm build
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

## Directory Structure

- `src/`
  - `index.ts` - Main entry point
  - `authService.ts` - Core authentication service
  - `context.tsx` - React context and provider
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions

## Contributing

See the main project README for contribution guidelines.
