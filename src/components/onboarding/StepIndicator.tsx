
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  index: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  index,
  title,
  isActive,
  isCompleted,
}) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors",
        isActive ? "bg-[#0ABAB5] text-white" : 
        isCompleted ? "bg-[#0ABAB5]/20 text-[#0ABAB5]" : 
        "bg-gray-700 text-gray-400"
      )}
    >
      {isCompleted ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <span className="flex items-center justify-center rounded-full h-5 w-5 text-xs font-medium">
          {index}
        </span>
      )}
      <span className="hidden sm:inline">{title}</span>
    </div>
  );
};
