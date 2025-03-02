"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Clock, Users, ChevronLeft, Loader2, Search, X } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [alternativeRecipes, setAlternativeRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);

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
      // First, fetch the user preferences
      const preferencesResponse = await fetch("/api/preferences");
      let userPreferences = {};
      
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        userPreferences = preferencesData.preferences || {};
      }
      
      // Then send both ingredients and preferences to the backend
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          ingredients,
          preferences: userPreferences 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Check if we have the new format with multiple recipes
        if (data.recipes && Array.isArray(data.recipes) && data.recipes.length > 0) {
          // Set the first recipe as the selected one
          setRecipe(data.recipes[0]);
          // Use the actual recipes from the response
          setAlternativeRecipes(data.recipes);
        } else {
          // Fallback for old format
          setRecipe(data);
          setAlternativeRecipes([
            data,
            {...data, title: `${data.title} Variation 1`},
            {...data, title: `${data.title} Variation 2`},
          ]);
        }
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addFilter = (filter: string) => {
    if (!filters.includes(filter)) {
      setFilters([...filters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter));
  };

  const selectRecipe = (index: number) => {
    setSelectedRecipeIndex(index);
    setRecipe(alternativeRecipes[index]);
  };

  // Helper function to calculate total time properly
  const calculateTotalTime = (prepTime: string, cookTime: string) => {
    // Extract numbers from strings
    const prepMinutes = parseInt(prepTime.replace(/[^0-9]/g, '') || '0');
    const cookMinutes = parseInt(cookTime.replace(/[^0-9]/g, '') || '0');
    
    // Calculate total
    const totalMinutes = prepMinutes + cookMinutes;
    
    return `${totalMinutes} minutes`;
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen font-[family-name:var(--font-geist-sans)] bg-green-50">
      {/* Navbar with light green background to match upload page */}
      <Navbar />

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 border-r border-green-100 p-4 md:p-6 bg-green-50">
          <div className="mb-6">
            <button 
              className="flex items-center text-green-700 mb-4 hover:underline font-medium"
              onClick={() => router.push('/upload')}
            >
              <ChevronLeft size={18} className="mr-1" />
              <span>Back to Upload</span>
            </button>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={18} />
              <input
                type="text"
                placeholder="Search recipes"
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter, index) => (
                <div key={index} className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-800 text-sm">{filter}</span>
                  <button onClick={() => removeFilter(filter)} className="ml-2 text-green-700">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button 
                className="text-sm text-green-700 hover:underline"
                onClick={() => addFilter("Dessert")}
              >
                Edit filters
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">Showing {alternativeRecipes.length} recipes</p>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={30} className="text-green-600 animate-spin" />
              </div>
            ) : alternativeRecipes.length > 0 ? (
              alternativeRecipes.map((recipeItem, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedRecipeIndex === index 
                      ? "bg-green-100 border-green-300 border" 
                      : "bg-white border border-gray-100 hover:border-green-200"
                  }`}
                  onClick={() => selectRecipe(index)}
                >
                  <h3 className="font-medium text-green-800 mb-1">{recipeItem.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recipeItem.ingredients.slice(0, 3).join(", ")}
                    {recipeItem.ingredients.length > 3 ? "..." : ""}
                  </p>
                  {index === 0 && (
                    <div className="mt-2 flex items-center">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Ready to make!
                      </span>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="mt-2 flex items-center">
                      {/* <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        2 ingredients needed!
                      </span> */}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recipes found
              </div>
            )}
          </div>
        </aside>

        {/* Main content - fixed height and consistent layout */}
        <main className="w-full md:w-2/3 p-4 md:p-6 bg-white min-h-[600px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="text-green-600 animate-spin mb-4 mx-auto" />
                <p className="text-lg text-gray-600 font-medium">Generating your recipe...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-6 font-medium text-lg">{error}</p>
                <button 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                  onClick={generateRecipe}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : recipe ? (
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6">{recipe.title}</h1>
              
              <div className="grid grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                  <h3 className="text-sm text-green-800 font-medium mb-1">Cook Time</h3>
                  <p className="font-medium text-gray-800">{recipe.cook_time}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                  <h3 className="text-sm text-green-800 font-medium mb-1">Prep Time</h3>
                  <p className="font-medium text-gray-800">{recipe.prep_time}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                  <h3 className="text-sm text-green-800 font-medium mb-1">Total Time</h3>
                  <p className="font-medium text-gray-800">
                    {calculateTotalTime(recipe.prep_time, recipe.cook_time)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg shadow-sm">
                  <h3 className="text-sm text-green-800 font-medium mb-1">Servings</h3>
                  <p className="font-medium text-gray-800">{recipe.servings}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-green-700 border-b border-green-100 pb-2">
                  Needed Ingredients:
                </h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start text-gray-800">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4 text-green-700 border-b border-green-100 pb-2">
                  Instructions
                </h2>
                <ol className="space-y-6">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center mr-4 font-medium shadow-sm">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-gray-800">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
                <h3 className="font-medium text-yellow-800 mb-3">Available Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((item, index) => (
                    <span key={index} className="bg-white px-3 py-1 text-sm rounded-full border border-yellow-200 text-yellow-800">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <motion.button
                className="mt-10 bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md hover:bg-green-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateRecipe}
              >
                <UtensilsCrossed size={18} />
                Generate Another Recipe
              </motion.button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-6 font-medium">No recipe generated yet.</p>
                <button 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                  onClick={generateRecipe}
                >
                  Generate Recipe
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="w-full border-t border-green-200 mt-12 py-6 bg-white">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} EcoEats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 