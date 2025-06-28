
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceholderTabContentProps {
  title: string;
  description: string;
}

export const PlaceholderTabContent: React.FC<PlaceholderTabContentProps> = ({
  title,
  description
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Esta funcionalidade estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  );
};
