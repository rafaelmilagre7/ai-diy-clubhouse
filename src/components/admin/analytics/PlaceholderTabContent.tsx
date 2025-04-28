
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChartBarIcon } from 'lucide-react';

interface PlaceholderTabContentProps {
  title: string;
  description: string;
}

export const PlaceholderTabContent = ({ title, description }: PlaceholderTabContentProps) => {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <ChartBarIcon className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-center max-w-md">
            Esta seção está em desenvolvimento. Em breve, você poderá visualizar análises detalhadas aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
