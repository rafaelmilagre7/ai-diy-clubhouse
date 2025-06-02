
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SuggestionErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

const SuggestionErrorState = ({ errorMessage, onRetry }: SuggestionErrorStateProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar sugestão</AlertTitle>
            <AlertDescription className="mt-2">
              {errorMessage || 'Não foi possível carregar os detalhes da sugestão.'}
              
              {onRetry && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                    className="gap-2"
                  >
                    <RefreshCw size={14} />
                    Tentar novamente
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionErrorState;
