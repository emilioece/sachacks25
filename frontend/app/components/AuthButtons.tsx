'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from 'framer-motion';

export const AuthButtons = () => {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="text-sm text-green-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-4">
        <div className="text-sm text-red-700">Error: {error.message}</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name || 'User'} 
              className="w-8 h-8 rounded-full border border-green-200"
            />
          )}
          <span className="text-sm text-green-800 hidden sm:inline">{user.name}</span>
        </div>
        <motion.a 
          className="text-sm hover:underline text-green-700 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          href="/api/auth/logout"
        >
          Logout
        </motion.a>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <motion.a 
        className="text-sm hover:underline text-green-700 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        href="/api/auth/login?screen_hint=signup"
      >
        Sign Up
      </motion.a>
      <motion.a 
        className="text-sm hover:underline text-green-700 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        href="/api/auth/login"
      >
        Login
      </motion.a>
    </div>
  );
}; 