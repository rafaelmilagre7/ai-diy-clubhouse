
import { FC } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardConnectionErrorState: FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-error-state text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 bg-status-error/10 rounded-full">
        <AlertTriangle className="h-8 w-8 text-status-error" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Erro de Conexão
        </h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.
        </p>
      </div>

      <Button 
        onClick={handleRefresh}
        className="bg-status-error hover:bg-status-error/90 text-primary-foreground"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar Novamente
      </Button>
    </div>
  );
};
