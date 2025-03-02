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
        email: session.user.email,
        name: session.user.name
      },
      create: {
        id: userId,
        email: session.user.email,
        name: session.user.name
      }
    });
    
    // Then create or update preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        allergies: data.allergies,
        dietaryRestrictions: data.dietaryRestrictions,
        mealType: data.mealType,
        cuisineTypes: data.cuisineType,
        prepTime: data.prepTime,
        cookingMethods: data.cookingMethod,
        preferredIngredients: data.preferredIngredients,
        avoidIngredients: data.avoidIngredients
      },
      create: {
        userId,
        allergies: data.allergies,
        dietaryRestrictions: data.dietaryRestrictions,
        mealType: data.mealType,
        cuisineTypes: data.cuisineType,
        prepTime: data.prepTime,
        cookingMethods: data.cookingMethod,
        preferredIngredients: data.preferredIngredients,
        avoidIngredients: data.avoidIngredients
      }
    });
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
} 