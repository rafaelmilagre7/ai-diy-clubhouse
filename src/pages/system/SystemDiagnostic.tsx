
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase, checkSupabaseConnection } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, RefreshCw, Bug, Info, Globe } from "lucide-react";
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
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [supabaseConfiguration, setSupabaseConfiguration] = useState<{
    url: string;
    anonKey: string;
  }>({ 
    url: 'https://zotzvtepvpnkcoobdubt.supabase.co', 
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ' 
  });
  
  // Verificar conexão com o Supabase
  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const { success, error } = await checkSupabaseConnection();
      setConnectionStatus(success ? 'online' : 'offline');
      if (!success) {
        setErrorDetails(error);
        log("Erro na conexão com o Supabase", { error });
      } else {
        toast.success("Conexão com o Supabase estabelecida com sucesso!");
      }
      setLastChecked(new Date());
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
    // No ambiente de produção, usamos valores fixos hardcoded em src/lib/supabase/client.ts
    const vars = {
      SUPABASE_URL: supabaseConfiguration.url,
      SUPABASE_ANON_KEY: supabaseConfiguration.anonKey ? 
        '***' + supabaseConfiguration.anonKey.substring(supabaseConfiguration.anonKey.length - 8) : undefined,
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
      
      <Card className="mb-8">
        <CardHeader className="bg-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Status Geral do Sistema</CardTitle>
            {lastChecked && (
              <Badge variant="outline" className="text-xs font-normal">
                Última verificação: {lastChecked.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <StatusBadge 
            status={connectionStatus} 
            label="Conexão" 
          />
          
          <StatusBadge 
            status={authStatus} 
            label="Autenticação" 
          />
          
          <StatusBadge 
            status={envVars.SUPABASE_URL ? 'ok' : 'error'} 
            label="URL Supabase" 
          />
          
          <StatusBadge 
            status={envVars.SUPABASE_ANON_KEY ? 'ok' : 'error'} 
            label="API Key" 
          />
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="env">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection" className="p-4 border rounded-md mt-4">
          <ConnectionTabContent status={connectionStatus} errorDetails={errorDetails} />
        </TabsContent>
        
        <TabsContent value="auth" className="p-4 border rounded-md mt-4">
          <AuthTabContent status={authStatus} errorDetails={errorDetails} />
        </TabsContent>
        
        <TabsContent value="env" className="p-4 border rounded-md mt-4">
          <EnvTabContent envVars={envVars} supabaseConfig={supabaseConfiguration} />
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
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-semibold">Passo 1: Configurações do Supabase</p>
                <p>As credenciais do Supabase foram atualizadas diretamente no código.</p>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-blue-50 border-blue-100">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <p className="font-semibold">Passo 2: Verificar projeto Supabase</p>
                <p>Acesse o painel do Supabase para confirmar que o projeto está ativo e funcionando.</p>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-green-50 border-green-100">
              <Globe className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                <p className="font-semibold">Passo 3: Explorar o aplicativo</p>
                <p>Agora que a conexão está configurada, você pode explorar as funcionalidades do VIVER DE IA Club.</p>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>Voltar</Button>
          <Button onClick={() => window.location.href = '/'} className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
            Ir para o Dashboard
          </Button>
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
const EnvTabContent = ({ 
  envVars, 
  supabaseConfig 
}: { 
  envVars: {[key: string]: string | undefined},
  supabaseConfig: { url: string, anonKey: string }
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Configuração do Supabase</h3>
        <div className="rounded border p-4 space-y-2">
          <div className="flex justify-between items-center">
            <code className="text-sm font-mono">SUPABASE_URL</code>
            <div className="flex items-center">
              <span className="font-mono text-sm mr-2 text-ellipsis overflow-hidden max-w-[200px]">
                {supabaseConfig.url}
              </span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <code className="text-sm font-mono">SUPABASE_ANON_KEY</code>
            <div className="flex items-center">
              <span className="font-mono text-sm mr-2">
                ***{supabaseConfig.anonKey.substring(supabaseConfig.anonKey.length - 8)}
              </span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700">Configurações atualizadas</AlertTitle>
        <AlertDescription className="text-green-600">
          <p>As configurações do Supabase foram atualizadas diretamente no código.</p>
          <p className="mt-2">Isso deve resolver os problemas de conexão com o backend.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SystemDiagnostic;
