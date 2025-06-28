
import React from 'react';

interface SolutionsGridLoaderProps {
  title: string;
  count?: number;
}

export const SolutionsGridLoader: React.FC<SolutionsGridLoaderProps> = ({ 
  title, 
  count = 3 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-white/10 rounded mb-3"></div>
            <div className="h-3 bg-white/10 rounded mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
