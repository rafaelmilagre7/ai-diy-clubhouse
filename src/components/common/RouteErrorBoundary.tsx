
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isRouteError: boolean;
}

interface RouteErrorBoundaryProps {
  children: ReactNode;
  onRouteError?: (error: Error) => void;
  fallbackRoute?: string;
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRouteError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    // Detectar se é um erro de roteamento
    const isRouteError = 
      error.message.includes('route') ||
      error.message.includes('navigation') ||
      error.message.includes('path') ||
      error.message.includes('router') ||
      error.message.includes('404') ||
      error.message.includes('not found');

    return {
      hasError: true,
      error,
      isRouteError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onRouteError } = this.props;
    const { isRouteError } = this.state;

    // Log específico para erros de roteamento
    logger.error('RouteErrorBoundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      currentPath: window.location.pathname,
      isRouteError,
      errorBoundary: 'RouteErrorBoundary'
    });

    if (isRouteError && onRouteError) {
      onRouteError(error);
    }

    // Toast específico para roteamento - sem mascarar
    if (isRouteError) {
      toast.error(`ERRO DE ROTA: ${error.message}`, {
        description: 'Problema ao carregar a página solicitada.'
      });
    } else {
      toast.error('Erro na página', {
        description: 'Ocorreu um problema ao renderizar esta página.'
      });
    }
  }

  handleGoBack = () => {
    // CORREÇÃO FASE 2: Usar navegação programática em vez de redirecionamento forçado
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Usar React Router em vez de window.location.href
      import('@/App').then(() => {
        // Trigger uma re-renderização da aplicação
        this.handleRetry();
      });
    }
  };

  handleGoHome = () => {
    // CORREÇÃO FASE 2: Evitar loops de redirecionamento
    this.setState({
      hasError: false,
      error: null,
      isRouteError: false,
    });
    
    // Tentar navegar programaticamente primeiro
    try {
      window.history.pushState({}, '', '/dashboard');
      this.handleRetry();
    } catch {
      // Fallback apenas se necessário
      const { fallbackRoute } = this.props;
      window.location.href = fallbackRoute || '/dashboard';
    }
  };

  handleRetry = () => {
    // Reset error state em vez de reload
    this.setState({
      hasError: false,
      error: null,
      isRouteError: false,
    });
  };

  render() {
    const { hasError, error, isRouteError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">
                {isRouteError ? 'Página não encontrada' : 'Erro na página'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {isRouteError ? (
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">
                    A página que você está procurando não existe ou não pôde ser carregada.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>URL atual:</strong> {window.location.pathname}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Verifique se o endereço está correto ou tente navegar pelo menu.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Ocorreu um problema ao carregar esta página.
                </p>
              )}

              {error && (
                <details className="bg-muted p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Informações técnicas
                  </summary>
                  <p className="text-muted-foreground">{error.message}</p>
                </details>
              )}

              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={this.handleGoBack} variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                
                <Button onClick={this.handleRetry} variant="outline" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Tentar novamente
                </Button>
                
                <Button onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default RouteErrorBoundary;
