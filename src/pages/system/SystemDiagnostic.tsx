
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase, checkSupabaseConnection } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, RefreshCw, Bug, Info } from "lucide-react";
import { toast } from "sonner";
import { useLogging } from "@/hooks/useLogging";

const SystemDiagnostic = () => {
  const { log } = useLogging("SystemDiagnostic");
  const [activeTab, setActiveTab] = useState("connection");
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [envVars, setEnvVars] = useState<{[key: string]: string | undefined}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  
  // Verificar conexão com o Supabase
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { success, error } = await checkSupabaseConnection();
      setConnectionStatus(success ? 'online' : 'offline');
      if (!success) {
        setErrorDetails(error);
        log("Erro na conexão com o Supabase", { error });
      }
    } catch (err) {
      setConnectionStatus('offline');
      setErrorDetails(err);
      log("Exceção ao verificar conexão", { error: err });
    }
  };
  
  // Verificar status de autenticação
  const checkAuth = async () => {
    setAuthStatus('checking');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setAuthStatus('unauthenticated');
        setErrorDetails(error);
        log("Erro ao verificar autenticação", { error });
        return;
      }
      
      setAuthStatus(data.session ? 'authenticated' : 'unauthenticated');
      log("Status de autenticação verificado", { 
        isAuthenticated: !!data.session, 
        userId: data.session?.user?.id 
      });
    } catch (err) {
      setAuthStatus('unauthenticated');
      setErrorDetails(err);
      log("Exceção ao verificar autenticação", { error: err });
    }
  };
  
  // Verificar variáveis de ambiente
  const checkEnv = () => {
    const vars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 
        '***' + (import.meta.env.VITE_SUPABASE_ANON_KEY as string).slice(-8) : undefined,
      NODE_ENV: import.meta.env.MODE,
      IS_DEV: import.meta.env.DEV ? 'true' : 'false',
    };
    
    setEnvVars(vars);
    log("Variáveis de ambiente verificadas", { vars });
  };
  
  // Realizar todas as verificações
  const runAllChecks = async () => {
    setIsLoading(true);
    try {
      await checkConnection();
      await checkAuth();
      checkEnv();
      toast.success("Todas as verificações concluídas");
    } catch (err) {
      toast.error("Erro ao executar verificações");
      log("Erro ao executar todas as verificações", { error: err });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Executar verificações na montagem do componente
  useEffect(() => {
    runAllChecks();
  }, []);
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Use esta ferramenta para diagnosticar problemas na plataforma
          </p>
        </div>
        
        <Button 
          onClick={runAllChecks} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </>
          )}
        </Button>
      </div>
      
      <div className="mb-8 flex flex-wrap gap-3">
        <StatusBadge 
          status={connectionStatus} 
          label="Conexão" 
        />
        
        <StatusBadge 
          status={authStatus} 
          label="Autenticação" 
        />
        
        <StatusBadge 
          status={envVars.VITE_SUPABASE_URL ? 'ok' : 'error'} 
          label="URL Supabase" 
        />
        
        <StatusBadge 
          status={envVars.VITE_SUPABASE_ANON_KEY ? 'ok' : 'error'} 
          label="API Key" 
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="env">Variáveis de Ambiente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="p-4 border rounded-md mt-4">
          <ConnectionTabContent status={connectionStatus} errorDetails={errorDetails} />
        </TabsContent>
        
        <TabsContent value="auth" className="p-4 border rounded-md mt-4">
          <AuthTabContent status={authStatus} errorDetails={errorDetails} />
        </TabsContent>
        
        <TabsContent value="env" className="p-4 border rounded-md mt-4">
          <EnvTabContent envVars={envVars} />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
          <CardDescription>Resolva os problemas identificados para restaurar o funcionamento da aplicação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-100">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-semibold">Passo 1: Verificar variáveis de ambiente</p>
                <p>Certifique-se de que as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> estão configuradas corretamente.</p>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-blue-50 border-blue-100">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-semibold">Passo 2: Verificar projeto Supabase</p>
                <p>Acesse o painel do Supabase para confirmar que o projeto está ativo e funcionando.</p>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-blue-50 border-blue-100">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-semibold">Passo 3: Verificar configuração de autenticação</p>
                <p>Confirme que a URL de redirecionamento está configurada corretamente no Supabase.</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>Voltar</Button>
          <Button onClick={runAllChecks} disabled={isLoading}>Verificar Novamente</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Componente para badge de status
interface StatusBadgeProps {
  status: string;
  label: string;
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  if (status === 'checking') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
        {label}: Verificando
      </Badge>
    );
  }
  
  if (status === 'online' || status === 'authenticated' || status === 'ok') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
        <CheckCircle className="mr-1 h-3 w-3" />
        {label}: OK
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
      <AlertCircle className="mr-1 h-3 w-3" />
      {label}: Problema
    </Badge>
  );
};

// Conteúdo da aba de conexão
const ConnectionTabContent = ({ status, errorDetails }: { status: string, errorDetails: any }) => {
  if (status === 'checking') {
    return (
      <div className="text-center py-6">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p>Verificando conexão com o servidor...</p>
      </div>
    );
  }
  
  if (status === 'online') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700">Conexão estabelecida</AlertTitle>
        <AlertDescription className="text-green-600">
          A conexão com o servidor Supabase está funcionando corretamente.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Erro de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao servidor Supabase. Verifique suas configurações.
        </AlertDescription>
      </Alert>
      
      {errorDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detalhes do erro</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-50 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Possíveis causas:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Chave de API do Supabase inválida ou ausente</li>
          <li>URL do Supabase incorreta ou ausente</li>
          <li>Servidor Supabase indisponível</li>
          <li>Problema temporário de rede</li>
        </ul>
      </div>
    </div>
  );
};

// Conteúdo da aba de autenticação
const AuthTabContent = ({ status, errorDetails }: { status: string, errorDetails: any }) => {
  if (status === 'checking') {
    return (
      <div className="text-center py-6">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p>Verificando status de autenticação...</p>
      </div>
    );
  }
  
  if (status === 'authenticated') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700">Autenticado</AlertTitle>
        <AlertDescription className="text-green-600">
          Você está autenticado no sistema.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Não autenticado</AlertTitle>
        <AlertDescription>
          Você não está autenticado ou houve um erro no processo de autenticação.
        </AlertDescription>
      </Alert>
      
      {errorDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detalhes do erro</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-50 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-700">Dica</AlertTitle>
        <AlertDescription className="text-blue-600">
          Tente fazer login novamente ou verifique as configurações de autenticação no projeto Supabase.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Conteúdo da aba de variáveis de ambiente
const EnvTabContent = ({ envVars }: { envVars: {[key: string]: string | undefined} }) => {
  return (
    <div className="space-y-4">
      <div className="rounded border p-4 space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <code className="text-sm font-mono">{key}</code>
            <div className="flex items-center">
              {value ? (
                <>
                  <span className="font-mono text-sm mr-2">{value}</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  <span className="text-sm text-red-500 mr-2">não definido</span>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Alert className="bg-amber-50 border-amber-200">
        <Bug className="h-5 w-5 text-amber-500" />
        <AlertTitle className="text-amber-700">Importância das variáveis</AlertTitle>
        <AlertDescription className="text-amber-600">
          <p>As variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> são essenciais para o funcionamento da aplicação.</p>
          <p className="mt-2">Se estiverem ausentes, você precisará configurá-las no arquivo <code>.env</code> ou nas configurações de deploy.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SystemDiagnostic;
