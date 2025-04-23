
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GeneralErrorProps {
  error: Error;
  id?: string;
  onRetry: () => void;
  availableSolutions?: any[];
}

export const GeneralError = ({ error, id, onRetry, availableSolutions }: GeneralErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar solução</AlertTitle>
        <AlertDescription>
          {error.message || "Ocorreu um erro ao carregar os detalhes desta solução."}
          
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p>Detalhes técnicos: {error.name} - {error.message}</p>
            <p>Soluções disponíveis: {availableSolutions?.length || 0}</p>
          </div>
        </AlertDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={onRetry} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" /> 
            Tentar novamente
          </Button>
          <Button
            onClick={() => navigate("/solutions")}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para soluções
          </Button>
        </div>
      </Alert>
    </div>
  );
};
