
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuggestionErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

const SuggestionErrorState: React.FC<SuggestionErrorStateProps> = ({
  errorMessage,
  onRetry
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar sugestão</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Não foi possível carregar os detalhes desta sugestão. Verifique sua conexão e tente novamente.'}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              )}
              <Button onClick={() => navigate('/suggestions')} className="gap-2">
                <Home className="h-4 w-4" />
                Voltar às sugestões
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionErrorState;
