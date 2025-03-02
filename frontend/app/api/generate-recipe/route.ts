import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// Cookie name prefix to make it unique per user
const COOKIE_PREFIX = 'user_preferences_';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.user?.sub;
    
    // Get the request body (ingredients and possibly preferences from the client)
    const requestData = await req.json();
    const { ingredients, preferences: clientPreferences } = requestData;
    
    // Get user preferences from cookie if user is logged in and client didn't provide preferences
    let userPreferences = clientPreferences || {};
    if (userId && !clientPreferences) {
      const cookieStore = cookies();
      const cookieName = `${COOKIE_PREFIX}${userId}`;
      const preferencesStr = (await cookieStore).get(cookieName)?.value;
      if (preferencesStr) {
        userPreferences = JSON.parse(preferencesStr);
      }
    }
    
    // Prepare the data to send to the backend
    const backendRequestData = {
      ingredients,
      preferences: userPreferences
    };
    
    // Call the backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/generate-recipe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to generate recipe' },
        { status: response.status }
      );
    }
    
    const recipe = await response.json();
    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
} 