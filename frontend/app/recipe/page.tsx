"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Clock, Users, ChevronLeft, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  cook_time: string;
  servings: number;
}

export default function RecipePage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load ingredients from session storage
  useEffect(() => {
    const storedIngredients = sessionStorage.getItem('detectedIngredients');
    if (storedIngredients) {
      setIngredients(JSON.parse(storedIngredients));
    } else {
      // If no ingredients found, redirect to upload page
      router.push('/upload');
    }
  }, [router]);

  // Generate recipe when ingredients are loaded
  useEffect(() => {
    if (ingredients.length > 0) {
      generateRecipe();
    }
  }, [ingredients]);

  // Redirect if not authenticated
  if (!userLoading && !user) {
    router.push('/api/auth/login');
    return null;
  }

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/generate-recipe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredients),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setRecipe(data);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-green-50">
      <Navbar />

      <main className="max-w-4xl mx-auto w-full my-8">
        <button 
          className="flex items-center text-green-700 mb-6 hover:underline"
          onClick={() => router.push('/upload')}
        >
          <ChevronLeft size={18} />
          <span>Back to Upload</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="text-green-600 animate-spin mb-4" />
              <p className="text-lg text-gray-600">Generating your recipe...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                onClick={generateRecipe}
              >
                Try Again
              </button>
            </div>
          ) : recipe ? (
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-6">{recipe.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-md">
                  <Clock size={18} className="text-green-600 mr-2" />
                  <span>Prep: {recipe.prep_time}</span>
                </div>
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-md">
                  <UtensilsCrossed size={18} className="text-green-600 mr-2" />
                  <span>Cook: {recipe.cook_time}</span>
                </div>
                <div className="flex items-center bg-green-50 px-4 py-2 rounded-md">
                  <Users size={18} className="text-green-600 mr-2" />
                  <span>Serves: {recipe.servings}</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Ingredients</h2>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2"></span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <h3 className="font-medium text-yellow-800 mb-2">Available Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map((item, index) => (
                        <span key={index} className="bg-white px-2 py-1 text-sm rounded border border-yellow-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Instructions</h2>
                  <ol className="space-y-4">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center mr-3 font-medium">
                          {index + 1}
                        </span>
                        <p className="pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
              
              <motion.button
                className="mt-8 bg-green-600 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateRecipe}
              >
                <UtensilsCrossed size={18} />
                Generate Another Recipe
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-600 mb-4">No recipe generated yet.</p>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                onClick={generateRecipe}
              >
                Generate Recipe
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full border-t border-green-200 mt-12 pt-6 pb-4">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Waste None. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 