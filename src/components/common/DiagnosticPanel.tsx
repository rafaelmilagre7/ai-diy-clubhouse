
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ConnectionStatus from "./ConnectionStatus";
import { Info, AlertCircle, ChevronDown, ChevronUp, Globe, LayoutDashboard, Database } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const DiagnosticPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({});
  const [showEnvVars, setShowEnvVars] = useState(false);
  const navigate = useNavigate();

  const checkEnvironmentVars = () => {
    const vars = {
      SUPABASE_URL: 'https://zotzvtepvpnkcoobdubt.supabase.co',
      SUPABASE_ANON_KEY: '***' + 'dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'.slice(-8),
      NODE_ENV: import.meta.env.MODE,
      IS_DEV: import.meta.env.DEV ? 'true' : 'false',
    };
    
    setEnvVars(vars);
    setShowEnvVars(true);
    toast.success("Variáveis de ambiente verificadas");
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Button 
        variant="outline" 
        onClick={() => setExpanded(true)}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg flex items-center"
      >
        <AlertCircle className="mr-2 h-4 w-4" />
        Diagnóstico
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
          Ferramenta para diagnosticar problemas da aplicação
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
          
          <Alert className="mt-3 bg-green-50 border-green-200">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">
              As chaves do Supabase foram configuradas diretamente no código.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Navegação</h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-between"
              onClick={() => navigateTo('/dashboard')}
            >
              <span>Dashboard do Membro</span>
              <LayoutDashboard className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-between"
              onClick={() => navigateTo('/admin')}
            >
              <span>Dashboard Admin</span>
              <Database className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full justify-between"
              onClick={() => navigateTo('/diagnostic')}
            >
              <span>Diagnóstico Completo</span>
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;
