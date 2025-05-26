
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TopicListErrorProps {
  onRetry: () => void;
  categorySlug?: string;
}

export const TopicListError: React.FC<TopicListErrorProps> = ({ onRetry, categorySlug }) => {
  return (
    <Card className="border-destructive/50">
      <CardContent className="py-12 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Erro ao carregar tópicos</h3>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar os tópicos {categorySlug ? `da categoria ${categorySlug}` : ''}.
          Verifique sua conexão e tente novamente.
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );
};
