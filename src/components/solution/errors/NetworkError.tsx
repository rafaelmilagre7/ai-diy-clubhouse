
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NetworkErrorProps {
  id?: string;
  onRetry: () => void;
  loading?: boolean;
}

export const NetworkError = ({ id, onRetry, loading }: NetworkErrorProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
        </AlertDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={onRetry} 
            className="flex items-center gap-2"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Tentar novamente
          </Button>
          <Button
            onClick={() => navigate("/solutions")}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para soluções
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </Alert>
    </div>
  );
};
