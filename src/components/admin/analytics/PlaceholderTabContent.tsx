
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderTabContentProps {
  title: string;
  description: string;
}

export const PlaceholderTabContent = ({ title, description }: PlaceholderTabContentProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-center max-w-md mt-2">{description}</p>
        <p className="text-muted-foreground text-center max-w-md mt-4">
          Esta seção está em desenvolvimento e estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  );
};
