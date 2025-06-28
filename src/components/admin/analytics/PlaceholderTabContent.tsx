
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PlaceholderTabContentProps {
  title: string;
  description: string;
  timeRange?: string;
}

export const PlaceholderTabContent: React.FC<PlaceholderTabContentProps> = ({
  title,
  description,
  timeRange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {timeRange && ` (Período: ${timeRange})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Esta funcionalidade estará disponível em breve.
        </p>
      </CardContent>
    </Card>
  );
};
