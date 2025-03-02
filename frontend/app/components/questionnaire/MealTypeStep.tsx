"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MealTypeStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MealTypeStep({ preferences, updatePreferences, onNext, onBack }: MealTypeStepProps) {
  const [otherCuisine, setOtherCuisine] = useState("");
  
  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
  
  const cuisineTypes = [
    "Italian", "Mexican", "Chinese", "Indian", "Japanese",
    "American", "Mediterranean", "Thai", "French", "Korean",
    "Vietnamese", "Spanish", "Greek", "Brazilian"
  ];
  
  const handleMealTypeSelect = (type: string) => {
    updatePreferences("mealType", type);
  };
  
  const handleCuisineSelect = (cuisine: string) => {
    const currentCuisines = preferences.cuisineType || [];
    if (currentCuisines.includes(cuisine)) {
      updatePreferences("cuisineType", currentCuisines.filter((c: string) => c !== cuisine));
    } else {
      updatePreferences("cuisineType", [...currentCuisines, cuisine]);
    }
  };
  
  const addOtherCuisine = () => {
    if (otherCuisine && !preferences.cuisineType.includes(otherCuisine)) {
      updatePreferences("cuisineType", [...preferences.cuisineType, otherCuisine]);
      setOtherCuisine("");
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-green-800">Meal Type</h2>
      
      {/* Meal Type Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Which type of meal are you looking to make?</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {mealTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleMealTypeSelect(type)}
              className={`px-4 py-2 rounded-md text-sm ${
                preferences.mealType === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Cuisine Type Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Which type of cuisine do you want?</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
          {cuisineTypes.map(cuisine => (
            <button
              key={cuisine}
              type="button"
              onClick={() => handleCuisineSelect(cuisine)}
              className={`px-3 py-2 rounded-md text-sm ${
                preferences.cuisineType?.includes(cuisine)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cuisine}
            </button>
          ))}
          
          <div className="flex items-center col-span-2 sm:col-span-3 md:col-span-4 mt-2">
            <input
              type="text"
              value={otherCuisine}
              onChange={(e) => setOtherCuisine(e.target.value)}
              placeholder="Other cuisine..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e) => e.key === "Enter" && addOtherCuisine()}
            />
            <button
              type="button"
              onClick={addOtherCuisine}
              className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center px-4 py-2 text-green-700 bg-white border border-green-600 rounded-md hover:bg-green-50"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back
        </button>
        
        <button
          type="button"
          onClick={onNext}
          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
} 