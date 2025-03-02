"use client";

import { Leaf } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export default function Navbar() {
  const { user, isLoading } = useUser();
  
  // Extract name safely
  const displayName = () => {
    if (typeof user?.given_name === 'string') return user.given_name;
    if (typeof user?.name === 'string') return user.name.split(' ')[0];
    return 'User';
  };
  
  return (
    <header className="flex justify-between items-center w-full mb-6">
      <Link href="/" className="text-2xl font-bold text-green-800 flex items-center gap-2">
        <Leaf className="text-green-600" size={24} />
        EcoEats
      </Link>
      
      <div className="flex gap-2">
        {isLoading ? (
          <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-green-700">Hi, {displayName()}</span>
            <a 
              href="/api/auth/logout"
              className="bg-white text-green-700 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
            >
              Log Out
            </a>
          </div>
        ) : (
          <>
            <a 
              href="/api/auth/login"
              className="bg-white text-green-700 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
            >
              Log In
            </a>
            <a 
              href="/api/auth/login?screen_hint=signup"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Sign Up
            </a>
          </>
        )}
      </div>
    </header>
  );
} 