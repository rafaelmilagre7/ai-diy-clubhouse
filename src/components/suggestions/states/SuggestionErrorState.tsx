
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface SuggestionErrorStateProps {
  errorMessage?: string;
  onRetry?: () => void;
}

const SuggestionErrorState = ({ 
  errorMessage = "Não foi possível carregar a sugestão",
  onRetry 
}: SuggestionErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/suggestions')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Sugestões
      </Button>

      {/* Error Card */}
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar sugestão</AlertTitle>
            <AlertDescription className="mt-2">
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            <Button onClick={() => navigate('/suggestions')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionErrorState;
