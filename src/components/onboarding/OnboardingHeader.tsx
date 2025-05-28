
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";

interface OnboardingHeaderProps {
  firstName?: string;
  isOnboardingCompleted: boolean;
  title?: string;
  step?: number;
  onBackClick?: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  firstName,
  isOnboardingCompleted,
  title,
  step,
  onBackClick
}) => {
  return (
    <div className="space-y-4">
      {onBackClick && (
        <Button 
          variant="ghost" 
          onClick={onBackClick} 
          className="flex items-center text-gray-400 hover:text-white -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar</span>
        </Button>
      )}
      
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">
            {title}
          </h2>
        </div>
      )}
    </div>
  );
};
