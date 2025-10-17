
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface CustomErrorFallbackProps {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryCount?: number;
  maxRetries?: number;
  showDetails?: boolean;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'detailed';
}

export const ErrorFallback: React.FC<CustomErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  retryCount = 0,
  maxRetries = 3,
  showDetails = false,
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Tente novamente ou volte para o dashboard.",
  icon,
  variant = 'default'
}) => {
  const canRetry = retryCount < maxRetries;
  
  const handleRetry = () => onRetry?.();
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/dashboard';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {icon || <AlertTriangle className="w-8 h-8 text-status-warning mb-4" />}
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex gap-2">
          {canRetry && (
            <Button size="sm" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Tentar novamente
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-status-warning/10 rounded-full flex items-center justify-center mb-4">
            {icon || <AlertTriangle className="w-6 h-6 text-status-warning" />}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{description}</p>

          {variant === 'detailed' && showDetails && error && (
            <details className="bg-muted p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Informações técnicas
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Mensagem:</strong> {error.message}
                </div>
                <div>
                  <strong>Tipo:</strong> {error.name}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack trace:</strong>
                    <pre className="text-xs overflow-auto mt-1 bg-background p-2 rounded max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            {canRetry && (
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            )}
            
            <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Tentativa {retryCount} de {maxRetries}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
