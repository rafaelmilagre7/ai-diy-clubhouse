
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlaceholderTabContentProps {
  title: string;
  description?: string;
  badges?: string[];
}

export const PlaceholderTabContent = ({ title, description = "Conteúdo em desenvolvimento", badges = [] }: PlaceholderTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {description}
          </p>
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {badges.map((badge, i) => (
                <Badge key={i} variant="outline">{badge}</Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
