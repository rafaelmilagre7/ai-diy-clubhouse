
import React from 'react';

interface ForumHeaderProps {
  title: string;
  description?: string;
}

export const ForumHeader = ({ title, description }: ForumHeaderProps) => {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
