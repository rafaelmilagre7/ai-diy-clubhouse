
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ConnectionStatus from "./ConnectionStatus";
import { Info, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export const DiagnosticPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({});
  const [showEnvVars, setShowEnvVars] = useState(false);

  const checkEnvironmentVars = () => {
    const vars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        '***' + (import.meta.env.VITE_SUPABASE_ANON_KEY as string).slice(-8) : undefined,
      NODE_ENV: import.meta.env.MODE,
      IS_DEV: import.meta.env.DEV ? 'true' : 'false',
    };
    
    setEnvVars(vars);
    setShowEnvVars(true);
  };

  const checkAuthentication = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao verificar autenticação:', error);
      return {
        isAuthenticated: false,
        error
      };
    }

    return {
      isAuthenticated: !!data.session,
      session: data.session
    };
  };

  if (!expanded) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg"
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Diagnosticar problemas
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[350px] md:w-[450px] z-50 shadow-xl">
      <CardHeader className="bg-slate-50 py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Painel de Diagnóstico</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Use esse painel para diagnosticar problemas na aplicação
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4 max-h-[500px] overflow-auto">
        <div>
          <h3 className="text-sm font-medium mb-2">Status da Conexão</h3>
          <ConnectionStatus />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Variáveis de Ambiente</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkEnvironmentVars}
            className="mb-2"
          >
            Verificar Variáveis
          </Button>
          
          {showEnvVars && (
            <div className="rounded bg-slate-50 p-3 text-xs font-mono">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between mb-1">
                  <span className="font-semibold">{key}:</span>
                  <span>{value || 'não definido'}</span>
                </div>
              ))}
            </div>
          )}
          
          <Alert className="mt-3 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              As chaves de API do Supabase devem estar corretamente configuradas nas variáveis de ambiente.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-2">Próximos Passos</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Verifique se as variáveis de ambiente estão corretas</li>
            <li>Verifique se o projeto do Supabase está ativo</li>
            <li>Certifique-se de que as chaves de API são válidas</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
