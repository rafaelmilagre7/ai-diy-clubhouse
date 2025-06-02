
import React from 'react';

interface SuggestionsPerformanceWrapperProps {
  children: React.ReactNode;
}

export const SuggestionsPerformanceWrapper: React.FC<SuggestionsPerformanceWrapperProps> = ({ 
  children 
}) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};
