
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isAuthError: boolean;
}

interface AuthErrorBoundaryProps {
  children: ReactNode;
  onAuthError?: () => void;
  redirectToLogin?: boolean;
}

class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isAuthError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    // Detectar se é um erro de autenticação
    const isAuthError = 
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('token') ||
      error.message.includes('session') ||
      error.message.includes('login') ||
      error.message.includes('permission');

    return {
      hasError: true,
      error,
      isAuthError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onAuthError, redirectToLogin } = this.props;
    const { isAuthError } = this.state;

    // Log específico para erros de autenticação
    logger.error('AuthErrorBoundary capturou um erro', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isAuthError,
      errorBoundary: 'AuthErrorBoundary'
    });

    if (isAuthError) {
      // Notificar callback de erro de autenticação
      if (onAuthError) {
        onAuthError();
      }

      // Toast específico para autenticação
      toast.error('Erro de autenticação', {
        description: 'Sua sessão pode ter expirado. Faça login novamente.'
      });

      // Redirecionar para login se configurado
      if (redirectToLogin) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } else {
      toast.error('Erro relacionado à autenticação', {
        description: 'Verifique suas permissões e tente novamente.'
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      isAuthError: false,
    });
  };

  handleLogin = () => {
    window.location.href = '/login';
  };

  render() {
    const { hasError, error, isAuthError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-status-warning/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-status-warning" />
              </div>
              <CardTitle className="text-xl">
                {isAuthError ? 'Problema de Autenticação' : 'Erro de Segurança'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {isAuthError ? (
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">
                    Sua sessão expirou ou você não tem permissão para acessar esta área.
                  </p>
                  <div className="bg-status-warning/10 border border-status-warning/30 rounded p-3">
                    <p className="text-sm text-status-warning">
                      <strong>Possíveis causas:</strong>
                    </p>
                    <ul className="text-sm text-status-warning/90 mt-1 space-y-1">
                      <li>• Sessão expirada</li>
                      <li>• Permissões insuficientes</li>
                      <li>• Token de acesso inválido</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Ocorreu um problema relacionado à segurança ou autenticação.
                </p>
              )}

              {error && (
                <details className="bg-muted p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalhes do erro
                  </summary>
                  <p className="text-muted-foreground">{error.message}</p>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                {isAuthError ? (
                  <Button onClick={this.handleLogin} className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Fazer Login
                  </Button>
                ) : (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleLogin} className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Ir para Login
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

export default AuthErrorBoundary;
