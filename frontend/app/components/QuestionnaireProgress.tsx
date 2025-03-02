"use client";

import { Check, Circle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  completed: boolean;
}

interface QuestionnaireProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export default function QuestionnaireProgress({ steps, currentStep, onStepClick }: QuestionnaireProgressProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-xl font-semibold mb-6 text-green-800">Let&apos;s get cooking!</h2>
      <p className="text-sm text-gray-600 mb-6">
        Follow these {steps.length} steps to get personalized recipe recommendations!
      </p>
      
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex items-start ${
              index <= currentStep || step.completed ? "cursor-pointer" : "cursor-not-allowed opacity-70"
            }`}
            onClick={() => {
              // Only allow clicking on completed steps or the current step
              if (index <= currentStep || step.completed) {
                onStepClick(index);
              }
            }}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index === currentStep 
                  ? "border-green-600 bg-green-100" 
                  : step.completed 
                    ? "border-green-600 bg-green-600" 
                    : "border-gray-300 bg-white"
              }`}>
                {step.completed ? (
                  <Check className="w-4 h-4 text-white" />
                ) : index === currentStep ? (
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </div>
              
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-12 -translate-x-1/2 ${
                  step.completed ? "bg-green-600" : "bg-gray-300"
                }`} />
              )}
            </div>
            
            <div className="ml-4">
              <h3 className={`font-medium ${
                index === currentStep 
                  ? "text-green-700" 
                  : step.completed 
                    ? "text-green-600" 
                    : "text-gray-500"
              }`}>
                {step.label}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 