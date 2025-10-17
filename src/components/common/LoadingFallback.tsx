
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { useNavigate } from 'react-router-dom';

interface LoadingFallbackProps {
  message?: string;
  showForceButton?: boolean;
  onForceComplete?: () => void;
  onRetry?: () => void;
  variant?: 'full' | 'partial' | 'inline';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Carregando...",
  showForceButton = true,
  onForceComplete,
  onRetry,
  variant = 'full'
}) => {
  const { 
    loadingState, 
    circuitBreakerActive, 
    retryCount, 
    forceComplete, 
    getLoadingDuration 
  } = useGlobalLoading();
  const navigate = useNavigate();

  const duration = getLoadingDuration();
  const isSlowLoading = duration > 3000;
  const isVerySlowLoading = duration > 6000;

  const handleForceComplete = () => {
    if (onForceComplete) {
      onForceComplete();
    } else {
      forceComplete();
    }
  };

  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Navegar para dashboard em vez de reload
      navigate('/dashboard');
    }
  };

  const getLoadingMessage = () => {
    if (circuitBreakerActive) {
      return "Sistema demorou para responder. Tente recarregar a página.";
    }
    
    if (isVerySlowLoading) {
      return "Carregamento mais demorado que o esperado...";
    }
    
    if (isSlowLoading) {
      return "Aguarde, carregando dados...";
    }
    
    return message;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'full':
        return "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center";
      case 'partial':
        return "absolute inset-0 bg-background/60 backdrop-blur-sm z-40 flex items-center justify-center";
      case 'inline':
        return "flex items-center justify-center py-8";
    }
  };

  if (variant === 'inline') {
    return (
      <div className={getVariantClasses()}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{getLoadingMessage()}</p>
          
          {(isVerySlowLoading || circuitBreakerActive) && showForceButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceComplete}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Forçar carregamento
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={getVariantClasses()}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {circuitBreakerActive ? (
              <AlertCircle className="h-12 w-12 text-status-warning" />
            ) : (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                {circuitBreakerActive ? 'Sistema Lento' : 'Carregando'}
              </h3>
              <p className="text-sm text-muted-foreground">{getLoadingMessage()}</p>
              
              {retryCount > 0 && !circuitBreakerActive && (
                <p className="text-xs text-status-warning">
                  Tentativa {retryCount + 1}...
                </p>
              )}
              
              {duration > 2000 && (
                <p className="text-xs text-muted-foreground">
                  {(duration / 1000).toFixed(1)}s decorridos
                </p>
              )}
            </div>

            {/* Estados específicos de loading */}
            {loadingState.auth && (
              <div className="text-xs text-operational bg-operational/10 px-2 py-1 rounded">
                Verificando autenticação...
              </div>
            )}
            
            {loadingState.data && (
              <div className="text-xs text-operational bg-operational/10 px-2 py-1 rounded">
                Carregando dados...
              </div>
            )}

            {(isVerySlowLoading || circuitBreakerActive) && showForceButton && (
              <div className="flex flex-col space-y-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={handleForceComplete}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Forçar carregamento
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReload}
                  className="w-full text-xs"
                >
                  Ir para Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
