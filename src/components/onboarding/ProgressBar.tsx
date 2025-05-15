
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full bg-gray-800/50 h-2 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
