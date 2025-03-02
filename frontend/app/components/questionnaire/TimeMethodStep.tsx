"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeMethodStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TimeMethodStep({ preferences, updatePreferences, onNext, onBack }: TimeMethodStepProps) {
  const [otherMethod, setOtherMethod] = useState("");
  
  const prepTimes = [
    { label: "< 10 min.", value: "under10" },
    { label: "15-30 min.", value: "15to30" },
    { label: "30-60 min.", value: "30to60" },
    { label: "1 hr+", value: "over60" }
  ];
  
  const cookingMethods = [
    "Stove Top", "Oven/Baking", "Grill", "Slow Cooker",
    "Air Fryer", "Instant Pot", "No Preference"
  ];
  
  const handlePrepTimeSelect = (time: string) => {
    updatePreferences("prepTime", time);
  };
  
  const handleCookingMethodSelect = (method: string) => {
    const currentMethods = preferences.cookingMethod || [];
    if (currentMethods.includes(method)) {
      updatePreferences("cookingMethod", currentMethods.filter((m: string) => m !== method));
    } else {
      updatePreferences("cookingMethod", [...currentMethods, method]);
    }
  };
  
  const addOtherMethod = () => {
    if (otherMethod && !preferences.cookingMethod.includes(otherMethod)) {
      updatePreferences("cookingMethod", [...preferences.cookingMethod, otherMethod]);
      setOtherMethod("");
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-green-800">Preparation Time & Method</h2>
      
      {/* Prep Time Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">How much time do you have to prepare your meal?</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {prepTimes.map(time => (
            <button
              key={time.value}
              type="button"
              onClick={() => handlePrepTimeSelect(time.value)}
              className={`px-4 py-2 rounded-md text-sm ${
                preferences.prepTime === time.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Cooking Method Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Which type of cooking method do you want?</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {cookingMethods.map(method => (
            <button
              key={method}
              type="button"
              onClick={() => handleCookingMethodSelect(method)}
              className={`px-3 py-2 rounded-md text-sm ${
                preferences.cookingMethod?.includes(method)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mt-2">
          <input
            type="text"
            value={otherMethod}
            onChange={(e) => setOtherMethod(e.target.value)}
            placeholder="Other cooking method..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && addOtherMethod()}
          />
          <button
            type="button"
            onClick={addOtherMethod}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
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