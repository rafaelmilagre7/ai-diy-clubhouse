
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ArrowLeft, Home, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface NetworkErrorProps {
  id?: string;
  onRetry: () => void;
  loading?: boolean;
}

export const NetworkError = ({ id, onRetry, loading }: NetworkErrorProps) => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  
  // Monitorar o status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onRetry();
  };
  
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de conexão</AlertTitle>
        <AlertDescription>
          {!isOnline 
            ? "Seu dispositivo está offline. Por favor, verifique sua conexão com a internet."
            : "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente."}
          
          {retryCount > 2 && (
            <div className="mt-2 text-sm">
              <p>Tentamos reconectar várias vezes sem sucesso. Isso pode indicar:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Problemas temporários com o servidor</li>
                <li>Bloqueio por firewall ou VPN</li>
                <li>Problemas com sua conexão de internet</li>
              </ul>
            </div>
          )}
        </AlertDescription>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={handleRetry} 
            className="flex items-center gap-2"
            variant="outline"
            disabled={loading || !isOnline}
          >
            {isOnline ? (
              <>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                Tentar novamente
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                Aguardando conexão
              </>
            )}
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
          
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" /> 
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
};
