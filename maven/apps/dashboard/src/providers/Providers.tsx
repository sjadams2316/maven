'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { UserProvider } from './UserProvider';
import { ReactNode } from 'react';

/**
 * COMBINED PROVIDERS WRAPPER
 * Wraps the app with all necessary providers in correct order
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
          card: "bg-[#12121a] border border-white/10",
        }
      }}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </ClerkProvider>
  );
}
