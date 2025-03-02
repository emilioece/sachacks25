"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TimeMethodStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TimeMethodStep({ preferences, updatePreferences, onNext, onBack }: TimeMethodStepProps) {
  const [methodInput, setMethodInput] = useState("");
  
  const prepTimes = [
    "Quick (< 15 min)", "Short (15-30 min)", "Medium (30-60 min)", "Long (> 60 min)"
  ];
  
  const popularMethods = [
    "Baking", "Grilling", "Frying", "Steaming", "Boiling", 
    "Roasting", "Sautéing", "Slow cooking", "Air frying", "Pressure cooking"
  ];
  
  const handlePrepTimeChange = (time: string) => {
    updatePreferences("prepTime", time);
  };
  
  const handleAddMethod = () => {
    if (methodInput.trim() && !preferences.cookingMethod.includes(methodInput.trim())) {
      updatePreferences("cookingMethod", [...preferences.cookingMethod, methodInput.trim()]);
      setMethodInput("");
    }
  };
  
  const handleMethodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMethod();
    }
  };
  
  const handleRemoveMethod = (method: string) => {
    updatePreferences("cookingMethod", preferences.cookingMethod.filter((m: string) => m !== method));
  };
  
  const handleMethodClick = (method: string) => {
    if (!preferences.cookingMethod.includes(method)) {
      updatePreferences("cookingMethod", [...preferences.cookingMethod, method]);
    } else {
      handleRemoveMethod(method);
    }
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-green-800">Preparation Time & Cooking Method</h2>
      
      {/* Prep Time Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">How much time do you have for preparation?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {prepTimes.map((time) => (
            <button
              key={time}
              className={`p-3 rounded-md border ${
                preferences.prepTime === time 
                  ? "bg-green-100 border-green-500 text-green-800" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handlePrepTimeChange(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      
      {/* Cooking Method Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3 text-green-700">Preferred cooking methods</h3>
        
        {/* Selected methods */}
        {preferences.cookingMethod.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.cookingMethod.map((method: string) => (
              <div 
                key={method} 
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{method}</span>
                <button 
                  className="ml-2 text-green-600 hover:text-green-800"
                  onClick={() => handleRemoveMethod(method)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Method input */}
        <div className="flex mb-4">
          <input
            type="text"
            value={methodInput}
            onChange={(e) => setMethodInput(e.target.value)}
            onKeyDown={handleMethodKeyDown}
            placeholder="Type a cooking method..."
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          />
          <button
            onClick={handleAddMethod}
            className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {/* Popular methods */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-2">Popular cooking methods:</h4>
          <div className="flex flex-wrap gap-2">
            {popularMethods.map((method) => (
              <button
                key={method}
                className={`px-3 py-1 rounded-full text-sm ${
                  preferences.cookingMethod.includes(method)
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
                onClick={() => handleMethodClick(method)}
              >
                {method}
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