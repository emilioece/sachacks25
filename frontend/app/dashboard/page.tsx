"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import QuestionnaireProgress from "../components/QuestionnaireProgress";
import MealTypeStep from "../components/questionnaire/MealTypeStep";
import TimeMethodStep from "../components/questionnaire/TimeMethodStep";
import IngredientsStep from "../components/questionnaire/IngredientsStep";
import AllergiesStep from "../components/questionnaire/AllergiesStep";

export default function Dashboard() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Questionnaire data
  const [preferences, setPreferences] = useState({
    allergies: [],
    dietaryRestrictions: [],
    mealType: "",
    cuisineType: [],
    prepTime: "",
    cookingMethod: [],
    preferredIngredients: [],
    avoidIngredients: []
  });
  
  // Update preferences
  const updatePreferences = (field: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Steps for the questionnaire
  const steps = [
    { id: 'allergies', label: 'Allergies/Dietary Preferences', completed: currentStep > 0 },
    { id: 'mealType', label: 'Meal Type', completed: currentStep > 1 },
    { id: 'timeMethod', label: 'Time & Cooking Method', completed: currentStep > 2 },
    { id: 'ingredients', label: 'Preferred Ingredients', completed: currentStep > 3 }
  ];
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user && !error) {
      router.push('/');
    }
  }, [user, isLoading, error, router]);
  
  // In the Dashboard component, add this function:
  const handleStepClick = (stepIndex: number) => {
    // Only allow going to steps that have been completed or the current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };
  
  // Add this function to your Dashboard component
  const savePreferences = async () => {
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      const data = await response.json();
      console.log('Preferences saved:', data);
      
      // Redirect to recipe generation page or dashboard
      router.push('/recipes');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };
  
  // Add this to your useEffect in the Dashboard component
  useEffect(() => {
    // Fetch saved preferences if user is authenticated
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setPreferences({
              allergies: data.preferences.allergies || [],
              dietaryRestrictions: data.preferences.dietaryRestrictions || [],
              mealType: data.preferences.mealType || "",
              cuisineType: data.preferences.cuisineTypes || [],
              prepTime: data.preferences.prepTime || "",
              cookingMethod: data.preferences.cookingMethods || [],
              preferredIngredients: data.preferences.preferredIngredients || [],
              avoidIngredients: data.preferences.avoidIngredients || []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    if (user) {
      fetchPreferences();
    }
  }, [user]);
  
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen">Error: {error.message}</div>;
  if (!user) return null;
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AllergiesStep 
            preferences={preferences} 
            updatePreferences={updatePreferences} 
            onNext={goToNextStep} 
          />
        );
      case 1:
        return (
          <MealTypeStep 
            preferences={preferences} 
            updatePreferences={updatePreferences} 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 2:
        return (
          <TimeMethodStep 
            preferences={preferences} 
            updatePreferences={updatePreferences} 
            onNext={goToNextStep} 
            onBack={goToPreviousStep} 
          />
        );
      case 3:
        return (
          <IngredientsStep 
            preferences={preferences} 
            updatePreferences={updatePreferences} 
            onBack={goToPreviousStep} 
            onSubmit={savePreferences} 
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-green-50">
      <Navbar />
      
      <main>
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Progress sidebar */}
              <div className="w-full md:w-1/3 bg-gray-100 p-6">
                <QuestionnaireProgress 
                  steps={steps} 
                  currentStep={currentStep} 
                  onStepClick={handleStepClick} 
                />
              </div>
              
              {/* Questionnaire content */}
              <div className="w-full md:w-2/3 p-6">
                {renderStep()}
              </div>
            </div>
          </div>
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