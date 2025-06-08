# Gofer UI Components

Shared UI component library for the Gofer platform. This package provides a collection of reusable components that work across web (React) and mobile (React Native) platforms.

## Installation

```bash
pnpm add @gofer/ui
```

## Usage

```tsx
import { Button, TaskCard, TaskList, Input } from '@gofer/ui';

function MyComponent() {
  return (
    <div>
      <Button 
        variant="primary" 
        onPress={() => console.log('Pressed!')}
      >
        Click Me
      </Button>
      
      <Input
        placeholder="Enter text"
        value={text}
        onChangeText={setText}
      />
      
      <TaskList
        tasks={tasks}
        onTaskPress={handleTaskPress}
        isLoading={loading}
      />
    </div>
  );
}
```

## Components

### Core Components

- `Button` - Multi-platform button component with variants
- `Input` - Text input with validation support
- `Card` - Flexible card container

### Task-Related Components

- `TaskCard` - Display individual task information
- `TaskList` - Scrollable list of tasks
- `TaskMap` - Map view of task locations
- `CreateTaskForm` - Form for creating new tasks
- `TaskBookingForm` - Form for booking a task

## Theming

The UI package uses a shared theme system that works across platforms:

```typescript
import { theme } from '@gofer/ui';

const { colors, spacing, typography } = theme;
```

### Customizing Theme

```typescript
import { createTheme } from '@gofer/ui';

const customTheme = createTheme({
  colors: {
    primary: '#007AFF',
    // ... other colors
  },
  // ... other theme values
});
```

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

4. Run Storybook:
   ```bash
   pnpm storybook
   ```

## Platform-Specific Code

Components automatically adapt to their platform (web/mobile) using platform detection:

```typescript
import { Platform } from 'react-native';

const styles = Platform.select({
  web: webStyles,
  default: nativeStyles
});
```

## Directory Structure

- `src/`
  - `components/` - UI components
  - `theme/` - Theme system
  - `hooks/` - Shared React hooks
  - `types/` - TypeScript definitions
  - `utils/` - Helper utilities

## Component Documentation

### Button

```tsx
import { Button } from '@gofer/ui';

<Button
  variant="primary" | "secondary" | "outline"
  size="small" | "medium" | "large"
  onPress={() => {}}
  disabled={false}
  loading={false}
>
  Button Text
</Button>
```

### TaskCard

```tsx
import { TaskCard } from '@gofer/ui';

<TaskCard
  task={taskData}
  onPress={handlePress}
  variant="compact" | "expanded"
/>
```

### Input

```tsx
import { Input } from '@gofer/ui';

<Input
  value={text}
  onChangeText={setText}
  placeholder="Enter text"
  error="Error message"
  variant="outline" | "filled"
/>
```

## Contributing

See the main project README for contribution guidelines.
