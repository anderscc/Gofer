# Gofer Mobile App

A TaskRabbit-like mobile application built with Expo and React Native.

## Features

- Modern, minimalist UI design
- Task browsing and searching
- Service categories
- Top taskers profiles
- Task posting and management

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Expo Vector Icons
- Linear Gradient

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Expo CLI

### Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm start
```

### Development Commands

- `pnpm start` - Start the Expo development server
- `pnpm android` - Start the app on an Android emulator/device
- `pnpm ios` - Start the app on an iOS simulator/device
- `pnpm web` - Start the app in a web browser

## Project Structure

```
src/
├── assets/            # Static assets (images, fonts, etc.)
├── components/        # Reusable UI components
├── constants/         # App-wide constants and theme
├── data/              # Mock data and types
├── features/          # Feature-based modules
├── navigation/        # Navigation setup and configs
└── screens/           # Screen components
```

## Design System

The app follows a consistent design system with predefined colors, typography, and component styles defined in the `src/constants/theme.ts` file.
