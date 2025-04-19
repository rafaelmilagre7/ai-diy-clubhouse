
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import SuggestionHeader from '../SuggestionHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

interface SuggestionErrorStateProps {
  onRetry?: () => void;
  errorMessage?: string;
}

const SuggestionErrorState = ({ onRetry, errorMessage }: SuggestionErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="container py-6">
      <SuggestionHeader />
      <Card>
        <CardHeader>
          <CardTitle>Sugestão não encontrada</CardTitle>
          <CardDescription>
            {errorMessage || "A sugestão que você está procurando não existe ou foi removida."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/suggestions')}
          >
            Voltar para todas as sugestões
          </Button>
          
          {onRetry && (
            <Button 
              variant="secondary" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Tentar novamente
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionErrorState;
