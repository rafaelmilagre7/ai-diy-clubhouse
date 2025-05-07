
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const DashboardConnectionErrorState = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Alert variant="destructive" className="mb-6 max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados do dashboard. Verifique sua conexão com a internet e tente novamente.
        </AlertDescription>
      </Alert>
      
      <Button onClick={handleRefresh} variant="default" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Atualizar página
      </Button>
    </div>
  );
};
