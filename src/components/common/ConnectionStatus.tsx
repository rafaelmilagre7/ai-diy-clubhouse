
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle, CheckCircle, Coffee } from "lucide-react";
import { checkSupabaseConnection } from "@/lib/supabase/client";
import { toast } from "sonner";

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const { success, error } = await checkSupabaseConnection();
      if (success) {
        setStatus('online');
        setErrorDetails(null);
      } else {
        setStatus('offline');
        setErrorDetails(error);
      }
      setLastChecked(new Date());
    } catch (error) {
      setStatus('offline');
      setErrorDetails(error);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <Coffee className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Verificando conexão...</AlertTitle>
        <AlertDescription className="text-blue-600">
          Estamos verificando a conexão com o servidor.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'online') {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Conexão estabelecida</AlertTitle>
        <AlertDescription className="text-green-600">
          A conexão com o servidor está funcionando corretamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="bg-red-50 border-red-200 mb-4">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-700">Problema de conexão</AlertTitle>
      <AlertDescription className="text-red-600">
        <p className="mb-3">
          Não foi possível conectar ao servidor. Isso pode ocorrer devido a:
        </p>
        <ul className="list-disc ml-6 mb-3 space-y-1">
          <li>Chaves de API do Supabase incorretas ou ausentes</li>
          <li>Problema temporário no servidor</li>
          <li>Problemas de rede</li>
        </ul>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={checkConnection}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
          
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
          </Button>
        </div>
        
        {showDetails && errorDetails && (
          <div className="mt-4 p-2 bg-red-100 rounded text-xs overflow-auto max-h-[100px]">
            <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatus;
