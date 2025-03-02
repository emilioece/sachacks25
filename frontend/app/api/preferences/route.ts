import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

// Cookie name prefix to make it unique per user
const COOKIE_PREFIX = 'user_preferences_';
// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  path: '/',
};

export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    const cookieStore = cookies();
    const cookieName = `${COOKIE_PREFIX}${userId}`;
    
    // Get preferences from cookie
    const preferencesStr = (await cookieStore).get(cookieName)?.value;
    const preferences = preferencesStr ? JSON.parse(preferencesStr) : {};
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    const data = await req.json();
    
    // Prepare preferences data
    const preferences = {
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
      mealType: data.mealType || null,
      cuisineTypes: Array.isArray(data.cuisineType) ? data.cuisineType : [],
      prepTime: data.prepTime || null,
      cookingMethods: Array.isArray(data.cookingMethod) ? data.cookingMethod : [],
      preferredIngredients: Array.isArray(data.preferredIngredients) ? data.preferredIngredients : [],
      avoidIngredients: Array.isArray(data.avoidIngredients) ? data.avoidIngredients : []
    };
    
    // Store preferences in cookie
    const cookieStore = cookies();
    const cookieName = `${COOKIE_PREFIX}${userId}`;
    (await cookieStore).set(cookieName, JSON.stringify(preferences), COOKIE_OPTIONS);
    
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ success: false, error: 'Failed to save preferences' }, { status: 500 });
  }
} 