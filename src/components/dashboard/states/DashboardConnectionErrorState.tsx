
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardConnectionErrorStateProps {
  onRetry?: () => void;
}

export const DashboardConnectionErrorState: React.FC<DashboardConnectionErrorStateProps> = ({
  onRetry
}) => {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Fallback: refresh da página atual em vez de reload
      window.location.href = window.location.pathname;
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Erro de Conexão
            </h3>
            <p className="text-gray-600">
              Não foi possível carregar os dados do dashboard. 
              Verifique sua conexão e tente novamente.
            </p>
          </div>
          
          <Button 
            onClick={handleRefresh}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
