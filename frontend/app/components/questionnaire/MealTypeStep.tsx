"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface MealTypeStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MealTypeStep({ preferences, updatePreferences, onNext, onBack }: MealTypeStepProps) {
  const [cuisineInput, setCuisineInput] = useState("");
  
  const mealTypes = [
    "Breakfast", "Lunch", "Dinner", "Snack", "Dessert"
  ];
  
  const popularCuisines = [
    "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
    "Thai", "French", "Mediterranean", "Korean", "American"
  ];
  
  const handleMealTypeChange = (mealType: string) => {
    updatePreferences("mealType", mealType);
  };
  
  const handleAddCuisine = () => {
    if (cuisineInput.trim() && !preferences.cuisineType.includes(cuisineInput.trim())) {
      updatePreferences("cuisineType", [...preferences.cuisineType, cuisineInput.trim()]);
      setCuisineInput("");
    }
  };
  
  const handleCuisineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCuisine();
    }
  };
  
  const handleRemoveCuisine = (cuisine: string) => {
    updatePreferences("cuisineType", preferences.cuisineType.filter((c: string) => c !== cuisine));
  };
  
  const handleCuisineClick = (cuisine: string) => {
    if (!preferences.cuisineType.includes(cuisine)) {
      updatePreferences("cuisineType", [...preferences.cuisineType, cuisine]);
    }
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-green-800">Meal Type & Cuisine</h2>
      
      {/* Meal Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">What type of meal are you looking for?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mealTypes.map((type) => (
            <button
              key={type}
              className={`p-3 rounded-md border ${
                preferences.mealType === type 
                  ? "bg-green-100 border-green-500 text-green-800" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleMealTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Cuisine Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">Any specific cuisines you prefer?</h3>
        
        {/* Selected cuisines */}
        {preferences.cuisineType.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.cuisineType.map((cuisine: string) => (
              <div 
                key={cuisine} 
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{cuisine}</span>
                <button 
                  className="ml-2 text-green-600 hover:text-green-800"
                  onClick={() => handleRemoveCuisine(cuisine)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Cuisine input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={cuisineInput}
            onChange={(e) => setCuisineInput(e.target.value)}
            onKeyDown={handleCuisineKeyDown}
            placeholder="Type a cuisine..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleAddCuisine}
            className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {/* Popular cuisines */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Popular cuisines:</h4>
          <div className="flex flex-wrap gap-2">
            {popularCuisines.map((cuisine) => (
              <button
                key={cuisine}
                className={`px-3 py-1 rounded-full text-sm ${
                  preferences.cuisineType.includes(cuisine)
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
                onClick={() => handleCuisineClick(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Next
        </button>
      </div>
    </div>
  );
} 