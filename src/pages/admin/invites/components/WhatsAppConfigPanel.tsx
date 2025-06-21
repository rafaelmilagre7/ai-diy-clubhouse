
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  MessageSquare,
  Loader2,
  Bug
} from 'lucide-react';
import { useWhatsAppDiagnostics } from '@/hooks/admin/invites/useWhatsAppDiagnostics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WhatsAppConfigPanel = () => {
  const { runFullDiagnostic, testWhatsAppCredentials, isRunning } = useWhatsAppDiagnostics();
  const [configData, setConfigData] = useState<any>(null);
  const [connectionData, setConnectionData] = useState<any>(null);
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔧 [WhatsApp Debug] ${message}`);
  };

  const checkConfiguration = async () => {
    setIsCheckingConfig(true);
    addLog('Iniciando verificação de configuração...');
    
    try {
      addLog('Chamando Edge Function whatsapp-config-check...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (error) {
        addLog(`Erro ao chamar Edge Function: ${error.message}`);
        toast.error(`Erro na verificação: ${error.message}`);
        throw error;
      }

      addLog('Edge Function respondeu com sucesso');
      addLog(`Dados recebidos: ${JSON.stringify(data)}`);
      
      setConfigData(data);
      toast.success('Configuração verificada com sucesso');
      
    } catch (error: any) {
      addLog(`Erro crítico: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro na verificação de configuração:', error);
      setConfigData({ error: error.message, isValid: false });
      
      // NÃO usar fallback - deixar o erro aparecer
      throw error;
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    addLog('Iniciando teste de conexão...');
    
    try {
      addLog('Chamando Edge Function para teste de conexão...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test_connection' }
      });

      if (error) {
        addLog(`Erro no teste de conexão: ${error.message}`);
        toast.error(`Erro no teste: ${error.message}`);
        throw error;
      }

      addLog('Teste de conexão concluído');
      addLog(`Resultado: ${JSON.stringify(data)}`);
      
      setConnectionData(data);
      
      if (data.success) {
        toast.success('Conexão com WhatsApp API bem-sucedida');
      } else {
        toast.error(`Falha na conexão: ${data.message}`);
      }
      
    } catch (error: any) {
      addLog(`Erro crítico no teste: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro no teste de conexão:', error);
      setConnectionData({ error: error.message, success: false });
      
      // NÃO usar fallback - deixar o erro aparecer
      throw error;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const runFullDiagnosticHandler = async () => {
    addLog('Executando diagnóstico completo...');
    
    try {
      const result = await runFullDiagnostic();
      addLog(`Diagnóstico completo: ${result.success ? 'SUCESSO' : 'FALHA'}`);
      addLog(`Detalhes: ${JSON.stringify(result)}`);
      
      if (result.success) {
        toast.success('Diagnóstico completo realizado com sucesso');
      } else {
        toast.error(`Diagnóstico falhou: ${result.message}`);
      }
    } catch (error: any) {
      addLog(`Erro no diagnóstico: ${error.message}`);
      console.error('Erro no diagnóstico completo:', error);
      throw error;
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs limpos');
  };

  const getStatusBadge = (isValid: boolean | undefined, error?: string) => {
    if (error) {
      return <Badge variant="destructive">Erro</Badge>;
    }
    if (isValid === undefined) {
      return <Badge variant="secondary">Não verificado</Badge>;
    }
    return isValid ? 
      <Badge variant="default" className="bg-green-600">Válido</Badge> : 
      <Badge variant="destructive">Inválido</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Status da Configuração</CardTitle>
            </div>
            {getStatusBadge(configData?.isValid, configData?.error)}
          </div>
          <CardDescription>
            Verificação das variáveis de ambiente necessárias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configData?.error ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Erro: {configData.error}</span>
            </div>
          ) : configData ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {configData.hasToken ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
                <span>WHATSAPP_API_TOKEN</span>
              </div>
              <div className="flex items-center gap-2">
                {configData.hasPhoneId ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
                <span>WHATSAPP_PHONE_NUMBER_ID</span>
              </div>
              <div className="flex items-center gap-2">
                {configData.hasBusinessId ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
                <span>WHATSAPP_BUSINESS_ID</span>
              </div>
              <div className="flex items-center gap-2">
                {configData.hasWebhookToken ? 
                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                  <XCircle className="h-4 w-4 text-red-500" />
                }
                <span>WHATSAPP_WEBHOOK_TOKEN</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Clique em "Verificar" para checar a configuração</p>
          )}
          
          <Button 
            onClick={checkConfiguration} 
            disabled={isCheckingConfig}
            className="w-full"
          >
            {isCheckingConfig ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Configuração
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Teste de Conexão</CardTitle>
            </div>
            {connectionData && getStatusBadge(connectionData.success, connectionData.error)}
          </div>
          <CardDescription>
            Teste real da conectividade com a API do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionData?.error ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">Erro: {connectionData.error}</span>
            </div>
          ) : connectionData?.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Conexão bem-sucedida</span>
              </div>
              {connectionData.details && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm"><strong>Número:</strong> {connectionData.details.phoneNumber}</p>
                  <p className="text-sm"><strong>Nome verificado:</strong> {connectionData.details.verifiedName}</p>
                </div>
              )}
            </div>
          ) : connectionData ? (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-700">{connectionData.message}</span>
            </div>
          ) : (
            <p className="text-muted-foreground">Clique em "Testar" para verificar a conexão</p>
          )}
          
          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnóstico Completo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <CardTitle>Diagnóstico Completo</CardTitle>
          </div>
          <CardDescription>
            Executa todos os testes e fornece relatório detalhado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runFullDiagnosticHandler} 
            disabled={isRunning}
            className="w-full"
            variant="outline"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              <>
                <Bug className="h-4 w-4 mr-2" />
                Executar Diagnóstico Completo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs de Debug */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logs de Debug</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpar
            </Button>
          </div>
          <CardDescription>
            Logs em tempo real das operações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Nenhum log ainda...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppConfigPanel;
