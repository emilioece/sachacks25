'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import React from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
}; 