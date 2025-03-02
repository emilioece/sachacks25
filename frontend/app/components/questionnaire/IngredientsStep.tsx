"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface IngredientsStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function IngredientsStep({ preferences, updatePreferences, onBack, onSubmit }: IngredientsStepProps) {
  const [preferredInput, setPreferredInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");
  
  const commonIngredients = [
    "Chicken", "Beef", "Pork", "Fish", "Tofu", 
    "Rice", "Pasta", "Potatoes", "Onions", "Garlic",
    "Tomatoes", "Bell peppers", "Carrots", "Broccoli", "Spinach"
  ];
  
  // Preferred ingredients handlers
  const handleAddPreferred = () => {
    if (preferredInput.trim() && !preferences.preferredIngredients.includes(preferredInput.trim())) {
      updatePreferences("preferredIngredients", [...preferences.preferredIngredients, preferredInput.trim()]);
      setPreferredInput("");
    }
  };
  
  const handlePreferredKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPreferred();
    }
  };
  
  const handleRemovePreferred = (ingredient: string) => {
    updatePreferences("preferredIngredients", 
      preferences.preferredIngredients.filter((i: string) => i !== ingredient)
    );
  };
  
  const handlePreferredClick = (ingredient: string) => {
    if (!preferences.preferredIngredients.includes(ingredient)) {
      updatePreferences("preferredIngredients", [...preferences.preferredIngredients, ingredient]);
    } else {
      handleRemovePreferred(ingredient);
    }
  };
  
  // Avoid ingredients handlers
  const handleAddAvoid = () => {
    if (avoidInput.trim() && !preferences.avoidIngredients.includes(avoidInput.trim())) {
      updatePreferences("avoidIngredients", [...preferences.avoidIngredients, avoidInput.trim()]);
      setAvoidInput("");
    }
  };
  
  const handleAvoidKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAvoid();
    }
  };
  
  const handleRemoveAvoid = (ingredient: string) => {
    updatePreferences("avoidIngredients", 
      preferences.avoidIngredients.filter((i: string) => i !== ingredient)
    );
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-green-800">Ingredient Preferences</h2>
      
      {/* Preferred Ingredients */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">Ingredients you prefer to use</h3>
        
        {/* Selected preferred ingredients */}
        {preferences.preferredIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.preferredIngredients.map((ingredient: string) => (
              <div 
                key={ingredient} 
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{ingredient}</span>
                <button 
                  className="ml-2 text-green-600 hover:text-green-800"
                  onClick={() => handleRemovePreferred(ingredient)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Preferred ingredient input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={preferredInput}
            onChange={(e) => setPreferredInput(e.target.value)}
            onKeyDown={handlePreferredKeyDown}
            placeholder="Type an ingredient..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleAddPreferred}
            className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {/* Common ingredients */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Common ingredients:</h4>
          <div className="flex flex-wrap gap-2">
            {commonIngredients.map((ingredient) => (
              <button
                key={ingredient}
                className={`px-3 py-1 rounded-full text-sm ${
                  preferences.preferredIngredients.includes(ingredient)
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
                onClick={() => handlePreferredClick(ingredient)}
              >
                {ingredient}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Avoid Ingredients */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">Ingredients you want to avoid</h3>
        
        {/* Selected avoid ingredients */}
        {preferences.avoidIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.avoidIngredients.map((ingredient: string) => (
              <div 
                key={ingredient} 
                className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{ingredient}</span>
                <button 
                  className="ml-2 text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveAvoid(ingredient)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Avoid ingredient input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={avoidInput}
            onChange={(e) => setAvoidInput(e.target.value)}
            onKeyDown={handleAvoidKeyDown}
            placeholder="Type an ingredient to avoid..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleAddAvoid}
            className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700"
          >
            Add
          </button>
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
          onClick={onSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
} 