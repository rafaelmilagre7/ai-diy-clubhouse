
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';

interface OnboardingErrorHandlerProps {
  error: string;
  type: 'validation' | 'network' | 'system' | 'unknown';
  onRetry?: () => void;
  onCancel?: () => void;
  showContactSupport?: boolean;
}

export const OnboardingErrorHandler: React.FC<OnboardingErrorHandlerProps> = ({
  error,
  type,
  onRetry,
  onCancel,
  showContactSupport = false
}) => {
  const getErrorTitle = () => {
    switch (type) {
      case 'validation':
        return 'Erro de Validação';
      case 'network':
        return 'Erro de Conexão';
      case 'system':
        return 'Erro do Sistema';
      default:
        return 'Erro Inesperado';
    }
  };

  const getErrorDescription = () => {
    switch (type) {
      case 'validation':
        return 'Verifique os dados preenchidos e tente novamente.';
      case 'network':
        return 'Verifique sua conexão com a internet e tente novamente.';
      case 'system':
        return 'Ocorreu um problema interno. Tente novamente em alguns momentos.';
      default:
        return 'Algo deu errado. Por favor, tente novamente.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-white">{getErrorTitle()}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          <p className="text-white/60 text-sm text-center">
            {getErrorDescription()}
          </p>

          <div className="space-y-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel} 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
            )}

            {showContactSupport && (
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = 'mailto:suporte@viverdeia.ai'}
                className="w-full"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-white/40">
              Código do erro: {type.toUpperCase()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
