import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  title = 'Algo deu errado', 
  message, 
  onRetry 
}: ErrorStateProps) => (
  <Alert variant="destructive" className="border-destructive/50">
    <AlertCircle className="h-5 w-5" aria-label="Ícone de erro" />
    <AlertTitle className="font-semibold">{title}</AlertTitle>
    <AlertDescription className="mt-2 space-y-3">
      <p>{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2 border-destructive/50 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar Novamente
        </Button>
      )}
    </AlertDescription>
  </Alert>
);
