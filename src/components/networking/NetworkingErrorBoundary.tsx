import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NetworkingErrorBoundaryProps {
  children: React.ReactNode;
}

interface NetworkingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class NetworkingErrorBoundary extends React.Component<
  NetworkingErrorBoundaryProps, 
  NetworkingErrorBoundaryState
> {
  constructor(props: NetworkingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): NetworkingErrorBoundaryState {
    console.error('🚨 NetworkingErrorBoundary capturou erro:', error);
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔥 Detalhes do erro de Networking:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Log do erro para analytics (se necessário)
    this.logErrorToAnalytics(error, errorInfo);
  }

  private logErrorToAnalytics(error: Error, errorInfo: React.ErrorInfo) {
    // Implementar log de erro para analytics se necessário
    try {
      console.warn('📊 Enviando erro para analytics:', {
        page: 'networking',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } catch (analyticsError) {
      console.error('❌ Erro ao enviar para analytics:', analyticsError);
    }
  }

  render() {
    if (this.state.hasError) {
      return <NetworkingErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface NetworkingErrorFallbackProps {
  onRetry: () => void;
}

const NetworkingErrorFallback: React.FC<NetworkingErrorFallbackProps> = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-card/95 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold">
            Ops! Algo deu errado no Networking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Encontramos um problema temporário na página de networking. 
            Não se preocupe, seus dados estão seguros!
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={onRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Se o problema persistir, nossa equipe já foi notificada e está trabalhando na correção.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};