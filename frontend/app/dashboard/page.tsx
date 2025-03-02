"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isLoading && !user && !error) {
      router.push('/');
    }
  }, [user, isLoading, error, router]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null; // This will be handled by the useEffect redirect
  
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-green-50">
      <Navbar />
      
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold mt-8">Welcome to Your Dashboard</h1>
        <p>This is a blank page for authenticated users.</p>
      </main>
      
      <footer className="w-full border-t border-green-200 mt-12 pt-6 pb-4">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Waste None. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 