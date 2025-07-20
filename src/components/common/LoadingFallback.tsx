
import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const navigate = useNavigate();

  const handleForceComplete = () => {
    if (onForceComplete) {
      onForceComplete();
    } else {
      // Forçar navegação para dashboard
      navigate('/dashboard');
    }
  };

  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      navigate('/dashboard');
    }
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
          <p className="text-sm text-muted-foreground">{message}</p>
          
          {showForceButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceComplete}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ir para Dashboard
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
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Carregando</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {showForceButton && (
              <div className="flex flex-col space-y-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={handleForceComplete}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleReload}
                  className="w-full text-xs"
                >
                  Recarregar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
