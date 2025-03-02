import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = session.user.sub;
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });
    
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
    
    // Create or update user record first
    await prisma.user.upsert({
      where: { id: userId },
      update: { 
        email: session.user.email || '',
        name: session.user.name || ''
      },
      create: {
        id: userId,
        email: session.user.email || '',
        name: session.user.name || ''
      }
    });
    
    // Ensure all arrays are defined, even if empty
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        allergies: Array.isArray(data.allergies) ? data.allergies : [],
        dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
        mealType: data.mealType || null,
        cuisineTypes: Array.isArray(data.cuisineType) ? data.cuisineType : [],
        prepTime: data.prepTime || null,
        cookingMethods: Array.isArray(data.cookingMethod) ? data.cookingMethod : [],
        preferredIngredients: Array.isArray(data.preferredIngredients) ? data.preferredIngredients : [],
        avoidIngredients: Array.isArray(data.avoidIngredients) ? data.avoidIngredients : []
      },
      create: {
        userId,
        allergies: Array.isArray(data.allergies) ? data.allergies : [],
        dietaryRestrictions: Array.isArray(data.dietaryRestrictions) ? data.dietaryRestrictions : [],
        mealType: data.mealType || null,
        cuisineTypes: Array.isArray(data.cuisineType) ? data.cuisineType : [],
        prepTime: data.prepTime || null,
        cookingMethods: Array.isArray(data.cookingMethod) ? data.cookingMethod : [],
        preferredIngredients: Array.isArray(data.preferredIngredients) ? data.preferredIngredients : [],
        avoidIngredients: Array.isArray(data.avoidIngredients) ? data.avoidIngredients : []
      }
    });
    
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ success: false, error: 'Failed to save preferences' }, { status: 500 });
  }
} 