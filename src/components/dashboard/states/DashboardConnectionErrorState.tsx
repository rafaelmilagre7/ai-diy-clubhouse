
import { FC } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardConnectionErrorState: FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Erro de Conexão
        </h2>
        <p className="text-gray-400 max-w-md">
          Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.
        </p>
      </div>

      <Button 
        onClick={handleRefresh}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar Novamente
      </Button>
    </div>
  );
};
