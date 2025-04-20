
import React from "react";

interface EtapasProgressoProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const EtapasProgresso: React.FC<EtapasProgressoProps> = ({
  currentStep,
  totalSteps,
  onStepClick
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    status: i + 1 < currentStep ? "completed" : i + 1 === currentStep ? "current" : "pending",
  }));

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div 
              className={`flex items-center justify-center rounded-full w-8 h-8 ${
                step.status === "completed" 
                  ? "bg-[#0ABAB5] text-white cursor-pointer" 
                  : step.status === "current" 
                  ? "bg-[#0ABAB5] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => {
                if (step.status === "completed" && onStepClick) {
                  onStepClick(step.number);
                }
              }}
            >
              {step.status === "completed" ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                step.number
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`h-1 w-10 ${
                  step.status === "completed" ? "bg-[#0ABAB5]" : "bg-gray-200"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
