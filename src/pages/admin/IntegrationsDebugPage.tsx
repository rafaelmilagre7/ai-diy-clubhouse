import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Database, 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Send,
  Settings,
  Phone,
  FileText,
  Mail,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PipedriveDebugData {
  success: boolean;
  account_info?: any;
  pipelines?: any[];
  stages?: any[];
  deal_fields?: any[];
  person_fields?: any[];
  users?: any[];
  activity_types?: any[];
  organizations_sample?: any[];
  products_sample?: any[];
  target_pipeline?: any;
  target_stage?: any;
  recommendations?: string[];
  error?: string;
}

interface TestData {
  solutionId: string;
  solutionTitle: string;
  solutionCategory: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

export const IntegrationsDebugPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pipedriveData, setPipedriveData] = useState<PipedriveDebugData | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Teste de implementação
  const [testData, setTestData] = useState<TestData>({
    solutionId: `test-id-${Date.now()}`,
    solutionTitle: 'Automação de Atendimento',
    solutionCategory: 'Automatização',
    userName: 'João Silva - Teste',
    userEmail: 'joao.teste@example.com',
    userPhone: '+55 11 99999-9999'
  });

  const mapPipedriveConfig = async () => {
    try {
      setIsLoading(true);
      setPipedriveData(null);
      
      const { data, error } = await supabase.functions.invoke('debug-pipedrive-mapping');
      
      if (error) {
        console.error('Erro ao chamar função:', error);
        throw error;
      }
      
      if (data) {
        setPipedriveData(data);
        if (data.success) {
          toast.success('Mapeamento realizado com sucesso!');
        } else {
          toast.error(data.error || 'Erro no mapeamento');
        }
      }
    } catch (error: any) {
      console.error('Erro no mapeamento:', error);
      toast.error(`Erro: ${error.message || 'Falha na comunicação com o servidor'}`);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        toast.error('Erro de conexão com Pipedrive. Verifique o token.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status dos secrets - será feito via edge function
  const [secretsStatus, setSecretsStatus] = useState<any>(null);

  // Executar verificação inicial quando o componente carrega
  useEffect(() => {
    checkSecretsStatus();
  }, []);

  const checkSecretsStatus = async () => {
    try {
      setIsLoading(true);
      
      // Chamar edge function que verifica secrets
      const { data, error } = await supabase.functions.invoke('validate-credentials');
      
      if (error) {
        console.error('Erro ao verificar secrets:', error);
        setSecretsStatus({
          pipedrive: false,
          discord: false
        });
        return;
      }

      // Verificar se temos dados válidos da validação
      if (data?.credentials) {
        const pipedriveCredential = data.credentials.find((c: any) => c.name === 'PIPEDRIVE_API_TOKEN');
        const discordCredential = data.credentials.find((c: any) => c.name === 'DISCORD_WEBHOOK_URL');
        
        setSecretsStatus({
          pipedrive: pipedriveCredential?.status === 'ok',
          discord: discordCredential?.status === 'ok'
        });
      } else {
        setSecretsStatus({
          pipedrive: false,
          discord: false
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      setSecretsStatus({
        pipedrive: false,
        discord: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-viverblue" />
        <div>
          <h1 className="text-3xl font-bold">Debug: Pipedrive + Discord</h1>
          <p className="text-muted-foreground">
            Teste e configure as integrações de contratação
          </p>
        </div>
      </div>

      <Tabs defaultValue="pipedrive" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipedrive">Pipedrive</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="teste">Teste</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Pipedrive Tab */}
        <TabsContent value="pipedrive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Pipedrive - Status e Configuração
              </CardTitle>
              <CardDescription>
                Verificação e teste da integração com Pipedrive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botão para verificar status do Pipedrive */}
              <Button 
                onClick={checkSecretsStatus} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar Status do Pipedrive
                  </>
                )}
              </Button>

              {/* Status do Pipedrive */}
              {secretsStatus && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5" />
                      <span>PIPEDRIVE_API_TOKEN</span>
                    </div>
                    {secretsStatus.pipedrive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              )}

              {secretsStatus && !secretsStatus.pipedrive && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Token do Pipedrive inválido ou não configurado. Verifique o token nas configurações.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Mapeamento do Pipedrive */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Mapeamento Completo</h3>
                <p className="text-sm text-muted-foreground">
                  Descubra toda a estrutura da sua conta Pipedrive
                </p>
                <Button 
                  onClick={mapPipedriveConfig} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mapeando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Fazer Mapeamento Completo
                    </>
                  )}
                </Button>

                {pipedriveData && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3">Resultados do Mapeamento:</h4>
                    <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-96">
                      {JSON.stringify(pipedriveData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discord Tab */}
        <TabsContent value="discord" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discord - Status e Configuração
              </CardTitle>
              <CardDescription>
                Verificação e teste da integração com Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Botão para verificar status do Discord */}
              <Button 
                onClick={checkSecretsStatus} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Verificar Status do Discord
                  </>
                )}
              </Button>

              {/* Status do Discord */}
              {secretsStatus && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5" />
                      <span>DISCORD_WEBHOOK_URL</span>
                    </div>
                    {secretsStatus.discord ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              )}

              {secretsStatus && !secretsStatus.discord && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Webhook do Discord inválido ou não configurado. Verifique a URL nas configurações.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Teste do Discord */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Teste de Webhook</h3>
                <p className="text-sm text-muted-foreground">
                  Envie uma mensagem de teste para o Discord
                </p>
                <Button 
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      
                      // Criar uma mensagem de teste para o Discord
                      const testMessage = {
                        content: "🔧 **Teste de Integração - Viver de IA**",
                        embeds: [{
                          title: "✅ Teste de Webhook Discord",
                          description: "Esta é uma mensagem de teste da integração com Discord.",
                          color: 3447003, // Azul
                          fields: [
                            {
                              name: "📊 Status",
                              value: "Integração funcionando corretamente",
                              inline: true
                            },
                            {
                              name: "⏰ Data/Hora",
                              value: new Date().toLocaleString('pt-BR'),
                              inline: true
                            }
                          ],
                          footer: {
                            text: "Viver de IA - Debug System"
                          }
                        }]
                      };

                      // Buscar a URL do webhook do Supabase Edge Functions
                      const webhookUrl = 'DISCORD_WEBHOOK_URL'; // Será substituído pela edge function
                      
                      // Enviar via Edge Function que tem acesso aos secrets
                      const { data, error } = await supabase.functions.invoke('test-discord-webhook', {
                        body: { message: testMessage }
                      });
                      
                      if (error) {
                        throw error;
                      }
                      
                      if (data?.success) {
                        toast.success('Mensagem enviada para o Discord com sucesso!');
                        setTestResult({ 
                          discord: true, 
                          message: 'Webhook Discord funcionando corretamente',
                          timestamp: new Date().toISOString()
                        });
                      } else {
                        throw new Error(data?.error || 'Erro desconhecido');
                      }
                      
                    } catch (error: any) {
                      console.error('Erro no teste Discord:', error);
                      toast.error(`Erro no teste Discord: ${error.message}`);
                      setTestResult({ 
                        discord: false, 
                        error: error.message,
                        timestamp: new Date().toISOString()
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading || !secretsStatus?.discord}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem de Teste
                </Button>

                {testResult && testResult.discord !== undefined && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Resultado do Teste Discord:</h4>
                    <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teste Tab */}
        <TabsContent value="teste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Teste de Implementação
              </CardTitle>
              <CardDescription>
                Simular uma solicitação de implementação completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID da Solução</label>
                  <input 
                    type="text" 
                    value={testData.solutionId}
                    onChange={(e) => setTestData({...testData, solutionId: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título da Solução</label>
                  <input 
                    type="text" 
                    value={testData.solutionTitle}
                    onChange={(e) => setTestData({...testData, solutionTitle: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <input 
                    type="text" 
                    value={testData.solutionCategory}
                    onChange={(e) => setTestData({...testData, solutionCategory: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Usuário</label>
                  <input 
                    type="text" 
                    value={testData.userName}
                    onChange={(e) => setTestData({...testData, userName: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    value={testData.userEmail}
                    onChange={(e) => setTestData({...testData, userEmail: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <input 
                    type="tel" 
                    value={testData.userPhone}
                    onChange={(e) => setTestData({...testData, userPhone: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <Button 
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const { data, error } = await supabase.functions.invoke('process-implementation-request', {
                      body: testData
                    });
                    
                    if (error) throw error;
                    
                    setTestResult(data);
                    toast.success('Teste executado com sucesso!');
                  } catch (error: any) {
                    console.error('Erro no teste:', error);
                    toast.error(`Erro: ${error.message}`);
                    setTestResult({ error: error.message });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Executando Teste...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Executar Teste Completo
                  </>
                )}
              </Button>

              {testResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Resultado do Teste:</h4>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logs e Monitoramento
              </CardTitle>
              <CardDescription>
                Visualizar logs das edge functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/debug-pipedrive-mapping/logs', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Logs Pipedrive
                </Button>
                <Button 
                  onClick={() => window.open('https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-implementation-request/logs', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Logs Implementação
                </Button>
                <Button 
                  onClick={() => window.open('https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/validate-credentials/logs', '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Logs Validação
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Status da Implementação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tabela implementation_requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Edge Functions criadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Validação implementada</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsDebugPage;