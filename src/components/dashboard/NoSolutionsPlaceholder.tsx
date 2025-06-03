
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface NoSolutionsPlaceholderProps {
  title: string;
  description: string;
}

export const NoSolutionsPlaceholder: React.FC<NoSolutionsPlaceholderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <Card className="border-dashed border-2 border-neutral-600 bg-transparent">
      <CardContent className="flex flex-col items-center justify-center py-12 text-left">
        <Lightbulb className="h-12 w-12 text-neutral-500 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-300 mb-2 text-left w-full">{title}</h3>
        <p className="text-neutral-500 text-left w-full">{description}</p>
      </CardContent>
    </Card>
  );
};
