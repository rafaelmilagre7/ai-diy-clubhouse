
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  onGoHome,
  title = "Problema de conexão",
  description = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
}) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-chart-md flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-operational/20 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-6 h-6 text-operational" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{description}</p>

          <div className="bg-muted p-3 rounded text-sm">
            <strong>Dicas para resolver:</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Verifique sua conexão com a internet</li>
              <li>• Tente recarregar a página</li>
              <li>• Aguarde alguns minutos e tente novamente</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </Button>
            )}
            
            <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Ir para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkError;
