
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
  resetOnLocationChange?: boolean;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onGoHome: () => void;
  retryCount: number;
  maxRetries: number;
  showDetails?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log do erro
    logger.error('ErrorBoundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary'
    });

    // Atualizar estado com informações do erro
    this.setState({
      error,
      errorInfo,
    });

    // Notificar callback personalizado se fornecido
    if (onError) {
      onError(error, errorInfo);
    }

    // Toast de notificação
    toast.error('Ocorreu um erro inesperado', {
      description: 'A página será recarregada automaticamente.'
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnLocationChange } = this.props;
    
    // Reset automático quando a localização muda
    if (resetOnLocationChange && this.state.hasError) {
      const currentLocation = window.location.pathname;
      const prevLocation = (window as any).__PREV_LOCATION__;
      
      if (currentLocation !== prevLocation) {
        this.handleRetry();
        (window as any).__PREV_LOCATION__ = currentLocation;
      }
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });

      logger.info('ErrorBoundary: Tentativa de recuperação', { 
        retryCount: retryCount + 1,
        maxRetries 
      });
    } else {
      toast.error('Número máximo de tentativas excedido', {
        description: 'Redirecionando para a página inicial.'
      });
      this.handleGoHome();
    }
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback: CustomFallback, maxRetries = 3, showDetails = false } = this.props;

    if (hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        onRetry: this.handleRetry,
        onGoHome: this.handleGoHome,
        retryCount: this.state.retryCount,
        maxRetries,
        showDetails,
      };

      // Usar fallback customizado se fornecido
      if (CustomFallback) {
        return <CustomFallback {...fallbackProps} />;
      }

      // Fallback padrão
      return <DefaultErrorFallback {...fallbackProps} />;
    }

    return children;
  }
}

// Componente de fallback padrão
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry,
  onGoHome,
  retryCount,
  maxRetries,
  showDetails = false,
}) => {
  const canRetry = retryCount < maxRetries;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Encontramos um problema inesperado. Nossa equipe foi notificada automaticamente.
          </p>

          {showDetails && error && (
            <details className="bg-muted p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Detalhes técnicos
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Erro:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="text-xs overflow-auto mt-1 bg-background p-2 rounded">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            {canRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente ({maxRetries - retryCount} restantes)
              </Button>
            )}
            
            <Button variant="outline" onClick={onGoHome} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Ir para o Dashboard
            </Button>
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Tentativas: {retryCount}/{maxRetries}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
