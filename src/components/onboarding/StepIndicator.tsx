
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  index: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  index,
  title,
  isActive,
  isCompleted,
  onClick,
}) => {
  const isClickable = !!onClick && (isCompleted || isActive);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-1 rounded-lg transition-all duration-200",
        isClickable ? "cursor-pointer hover:bg-neutral-100" : "cursor-default",
        isActive && "font-medium"
      )}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div 
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
          isCompleted 
            ? "bg-green-500 text-white" 
            : isActive 
              ? "bg-viverblue text-white shadow-sm" 
              : "bg-neutral-200 text-neutral-600"
        )}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : index}
      </div>
      <span 
        className={cn(
          "text-sm whitespace-nowrap",
          isActive 
            ? "text-viverblue-dark" 
            : isCompleted 
              ? "text-neutral-800" 
              : "text-neutral-500"
        )}
      >
        {title}
      </span>
    </div>
  );
};
