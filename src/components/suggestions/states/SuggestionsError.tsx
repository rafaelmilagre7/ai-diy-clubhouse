
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SuggestionsErrorProps {
  error: any;
  onRetry?: () => void;
}

export const SuggestionsError: React.FC<SuggestionsErrorProps> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="container py-8 max-w-4xl">
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Erro ao carregar sugestões</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro ao tentar carregar as sugestões da comunidade.
            </p>
            {error?.message && (
              <p className="text-sm text-destructive mt-2">
                {error.message}
              </p>
            )}
          </div>
          
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
