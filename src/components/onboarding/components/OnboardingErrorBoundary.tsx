
import React, { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class OnboardingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ONBOARDING-ERROR-BOUNDARY] Erro capturado:', error, errorInfo);
    
    logger.error('Erro crítico no onboarding', error, {
      component: 'OnboardingErrorBoundary',
      errorInfo: errorInfo.componentStack
    });

    this.setState({ 
      hasError: true, 
      error, 
      errorInfo 
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-red-500/20">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Oops! Algo deu errado
                </h2>
                <p className="text-neutral-300 text-sm">
                  Ocorreu um erro inesperado durante o onboarding. 
                  Você pode tentar novamente ou voltar ao dashboard.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-red-950/20 border border-red-500/20 rounded p-3">
                  <p className="text-xs text-red-400 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 flex-1 bg-viverblue hover:bg-viverblue/90"
                >
                  <Home className="h-4 w-4" />
                  Ir ao Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
