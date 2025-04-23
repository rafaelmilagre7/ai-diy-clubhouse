
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ArrowLeft, Home, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface GeneralErrorProps {
  error: Error;
  id?: string;
  onRetry: () => void;
  availableSolutions?: any[];
}

export const GeneralError = ({ error, id, onRetry, availableSolutions }: GeneralErrorProps) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  
  // Verifica se o erro é relacionado a permissões de acesso
  const isPossiblePermissionError = error.message.includes('permission') || 
                                   error.message.includes('not allowed') || 
                                   error.message.includes('access denied');

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar solução</AlertTitle>
        <AlertDescription>
          {isPossiblePermissionError 
            ? "Você pode não ter permissão para acessar esta solução. Entre em contato com o administrador." 
            : error.message || "Ocorreu um erro ao carregar os detalhes desta solução."}
          
          {showDetails && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-auto">
              <p>Detalhes técnicos: {error.name} - {error.message}</p>
              <p>ID da solução: {id || 'não informado'}</p>
              <p>Soluções disponíveis: {availableSolutions?.length || 0}</p>
              {availableSolutions?.length > 0 && (
                <ul className="mt-1 list-disc list-inside">
                  {availableSolutions.slice(0, 5).map(s => (
                    <li key={s.id}>{s.title} (ID: {s.id?.substring(0, 8)}...)</li>
                  ))}
                  {availableSolutions.length > 5 && <li>...mais {availableSolutions.length - 5} soluções</li>}
                </ul>
              )}
            </div>
          )}
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
          
          <Button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
            variant="ghost"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
          
          <Button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 ml-auto"
            variant="ghost"
            size="sm"
          >
            <Database className="h-4 w-4" />
            {showDetails ? "Ocultar detalhes" : "Detalhes técnicos"}
          </Button>
        </div>
      </Alert>
    </div>
  );
};
