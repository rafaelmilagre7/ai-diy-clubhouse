
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi } from "lucide-react";

export const DashboardConnectionErrorState: FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card variant="outline" className="max-w-md mx-auto text-center">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-error/10 rounded-2xl">
              <Wifi className="h-12 w-12 text-error" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Text variant="subsection" textColor="primary">
              Problema de Conexão
            </Text>
            <Text variant="body" textColor="secondary">
              Não foi possível carregar seus dados. Verifique sua conexão com a internet e tente novamente.
            </Text>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRefresh} className="hover-scale">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
