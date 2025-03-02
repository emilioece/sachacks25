"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AllergiesStepProps {
  preferences: any;
  updatePreferences: (field: string, value: any) => void;
  onNext: () => void;
}

export default function AllergiesStep({ preferences, updatePreferences, onNext }: AllergiesStepProps) {
  const [newAllergy, setNewAllergy] = useState("");
  const [newDietary, setNewDietary] = useState("");
  
  const commonAllergies = [
    "Peanuts", "Tree Nuts", "Milk", "Eggs", "Wheat", "Soy", "Fish", "Shellfish"
  ];
  
  const dietaryRestrictions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb"
  ];
  
  const addAllergy = (allergy: string) => {
    if (allergy && !preferences.allergies.includes(allergy)) {
      updatePreferences("allergies", [...preferences.allergies, allergy]);
    }
    setNewAllergy("");
  };
  
  const removeAllergy = (allergy: string) => {
    updatePreferences("allergies", preferences.allergies.filter((a: string) => a !== allergy));
  };
  
  const addDietary = (diet: string) => {
    if (diet && !preferences.dietaryRestrictions.includes(diet)) {
      updatePreferences("dietaryRestrictions", [...preferences.dietaryRestrictions, diet]);
    }
    setNewDietary("");
  };
  
  const removeDietary = (diet: string) => {
    updatePreferences("dietaryRestrictions", preferences.dietaryRestrictions.filter((d: string) => d !== diet));
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-green-800">Allergies/Dietary Preferences</h2>
      
      {/* Allergies Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Do you have any food allergies?</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {commonAllergies.map(allergy => (
            <button
              key={allergy}
              type="button"
              onClick={() => addAllergy(allergy)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                preferences.allergies.includes(allergy)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            placeholder="Add other allergy..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            onKeyDown={(e) => e.key === "Enter" && addAllergy(newAllergy)}
          />
          <button
            type="button"
            onClick={() => addAllergy(newAllergy)}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {preferences.allergies.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Your allergies:</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.allergies.map((allergy: string) => (
                <div key={allergy} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
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
      
      {/* Dietary Restrictions Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-3 text-gray-700">Any dietary restrictions or preferences?</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {dietaryRestrictions.map(diet => (
            <button
              key={diet}
              type="button"
              onClick={() => addDietary(diet)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                preferences.dietaryRestrictions.includes(diet)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mb-2">
          <input
            type="text"
            value={newDietary}
            onChange={(e) => setNewDietary(e.target.value)}
            placeholder="Add other dietary restriction..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            onKeyDown={(e) => e.key === "Enter" && addDietary(newDietary)}
          />
          <button
            type="button"
            onClick={() => addDietary(newDietary)}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add
          </button>
        </div>
        
        {preferences.dietaryRestrictions.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Your dietary restrictions:</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.dietaryRestrictions.map((diet: string) => (
                <div key={diet} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {diet}
                  <button
                    type="button"
                    onClick={() => removeDietary(diet)}
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
      
      {/* Navigation */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Next
        </button>
      </div>
    </div>
  );
} 