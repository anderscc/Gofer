'use client';

import { AuthProvider } from '@gofer/auth';
import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
