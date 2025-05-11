
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, LineChart } from 'lucide-react';

interface PlaceholderTabContentProps {
  title: string;
  description: string;
  icon?: 'chart' | 'graph';
}

export const PlaceholderTabContent: React.FC<PlaceholderTabContentProps> = ({
  title,
  description,
  icon = 'chart'
}) => {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        {icon === 'chart' ? (
          <FileBarChart className="h-16 w-16 text-muted-foreground/50" />
        ) : (
          <LineChart className="h-16 w-16 text-muted-foreground/50" />
        )}
        <p className="mt-4 text-center text-muted-foreground">
          Esta funcionalidade está em desenvolvimento e estará disponível em breve.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Os dados necessários estão sendo coletados para fornecer análises relevantes.
        </p>
      </CardContent>
    </Card>
  );
};
