"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";

interface IngredientsStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function IngredientsStep({ preferences, updatePreferences, onBack, onSubmit }: IngredientsStepProps) {
  const [newPreferredIngredient, setNewPreferredIngredient] = useState("");
  const [newAvoidIngredient, setNewAvoidIngredient] = useState("");
  
  const commonIngredients = [
    "Chicken", "Beef", "Pork", "Fish", "Rice", "Pasta", 
    "Potatoes", "Tomatoes", "Onions", "Garlic", "Bell Peppers"
  ];
  
  const addPreferredIngredient = (ingredient: string) => {
    if (ingredient && !preferences.preferredIngredients.includes(ingredient)) {
      updatePreferences("preferredIngredients", [...preferences.preferredIngredients, ingredient]);
    }
    setNewPreferredIngredient("");
  };
  
  const removePreferredIngredient = (ingredient: string) => {
    updatePreferences("preferredIngredients", 
      preferences.preferredIngredients.filter((i: string) => i !== ingredient)
    );
  };
  
  const addAvoidIngredient = (ingredient: string) => {
    if (ingredient && !preferences.avoidIngredients.includes(ingredient)) {
      updatePreferences("avoidIngredients", [...preferences.avoidIngredients, ingredient]);
    }
    setNewAvoidIngredient("");
  };
  
  const removeAvoidIngredient = (ingredient: string) => {
    updatePreferences("avoidIngredients", 
      preferences.avoidIngredients.filter((i: string) => i !== ingredient)
    );
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-green-800">Preferred Ingredients</h2>
      
      {/* Preferred Ingredients */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">What ingredients would you like to include?</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {commonIngredients.map(ingredient => (
            <button
              key={ingredient}
              type="button"
              onClick={() => addPreferredIngredient(ingredient)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                preferences.preferredIngredients?.includes(ingredient)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {ingredient}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newPreferredIngredient}
            onChange={(e) => setNewPreferredIngredient(e.target.value)}
            placeholder="Add other ingredient..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && addPreferredIngredient(newPreferredIngredient)}
          />
          <button
            type="button"
            onClick={() => addPreferredIngredient(newPreferredIngredient)}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {preferences.preferredIngredients?.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Your preferred ingredients:</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.preferredIngredients.map((ingredient: string) => (
                <div key={ingredient} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removePreferredIngredient(ingredient)}
                    className="ml-1.5 text-green-600 hover:text-green-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Avoid Ingredients */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Any ingredients you want to avoid?</h3>
        
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newAvoidIngredient}
            onChange={(e) => setNewAvoidIngredient(e.target.value)}
            placeholder="Add ingredient to avoid..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && addAvoidIngredient(newAvoidIngredient)}
          />
          <button
            type="button"
            onClick={() => addAvoidIngredient(newAvoidIngredient)}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {preferences.avoidIngredients?.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Ingredients to avoid:</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.avoidIngredients.map((ingredient: string) => (
                <div key={ingredient} className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeAvoidIngredient(ingredient)}
                    className="ml-1.5 text-red-600 hover:text-red-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
          onClick={onSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
} 