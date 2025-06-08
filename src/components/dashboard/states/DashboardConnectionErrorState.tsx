
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Wifi, RefreshCw, AlertTriangle, Settings } from "lucide-react";

export const DashboardConnectionErrorState: FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoToSettings = () => {
    window.location.href = '/settings';
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card variant="elevated" className="max-w-md mx-auto text-center">
        <CardContent className="p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="p-4 bg-error/10 rounded-2xl">
                <Wifi className="h-12 w-12 text-error" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-warning rounded-full">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <Text variant="subsection" textColor="primary" className="font-bold">
              Problema de Conexão
            </Text>
            <Text variant="body" textColor="secondary">
              Não foi possível carregar seus dados. Verifique sua conexão com a internet e tente novamente.
            </Text>
            
            <Badge variant="error" size="sm" className="mx-auto">
              Sem conexão
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full hover-scale">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoToSettings}
              className="w-full hover-scale"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>

          {/* Help Text */}
          <Text variant="caption" textColor="tertiary" className="mt-4">
            Se o problema persistir, entre em contato com o suporte
          </Text>
        </CardContent>
      </Card>
    </div>
  );
};
