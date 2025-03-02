'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';

export const AuthButtons = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="text-sm text-green-700 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
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
        <motion.button 
          className="text-sm hover:underline text-green-700"
          whileHover={{ scale: 1.05 }}
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Logout
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <motion.button 
        className="text-sm hover:underline text-green-700"
        whileHover={{ scale: 1.05 }}
        onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
      >
        Sign Up
      </motion.button>
      <motion.button 
        className="text-sm hover:underline text-green-700"
        whileHover={{ scale: 1.05 }}
        onClick={() => loginWithRedirect()}
      >
        Login
      </motion.button>
    </div>
  );
}; 