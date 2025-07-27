import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  MessageSquare, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Send,
  RefreshCw,
  Eye,
  Settings,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const IntegrationsDebugPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pipedriveMapping, setPipedriveMapping] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [testData, setTestData] = useState({
    solutionTitle: 'Automação de Atendimento',
    solutionCategory: 'Automatização',
    userName: 'João Silva - Teste',
    userEmail: 'joao.teste@example.com',
    userPhone: '+55 11 99999-9999'
  });

  // Mapear configurações do Pipedrive
  const mapPipedriveConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('debug-pipedrive-mapping');
      
      if (error) {
        toast({
          title: "Erro no mapeamento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPipedriveMapping(data);
      toast({
        title: "Mapeamento concluído! ✅",
        description: "Configurações do Pipedrive carregadas",
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Falha ao mapear configurações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Testar criação de deal
  const testPipedriveIntegration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-implementation-request', {
        body: {
          solutionId: 'test-id-' + Date.now(),
          solutionTitle: testData.solutionTitle,
          solutionCategory: testData.solutionCategory,
          userName: testData.userName,
          userEmail: testData.userEmail,
          userPhone: testData.userPhone
        }
      });

      if (error) {
        setTestResults(prev => ({
          ...prev,
          pipedrive: { success: false, error: error.message }
        }));
        return;
      }

      setTestResults(prev => ({
        ...prev,
        pipedrive: data?.pipedrive || { success: false, error: 'No pipedrive data' },
        discord: data?.discord || { success: false, error: 'No discord data' },
        database: { success: !!data?.requestId, requestId: data?.requestId }
      }));

      toast({
        title: data?.success ? "Teste realizado! ✅" : "Teste falhou ❌",
        description: data?.message || "Verifique os resultados",
        variant: data?.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro:', error);
      setTestResults(prev => ({
        ...prev,
        error: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status dos secrets
  const checkSecretsStatus = () => {
    return {
      pipedrive: !!process.env.PIPEDRIVE_API_TOKEN,
      discord: !!process.env.DISCORD_WEBHOOK_URL
    };
  };

  const secretsStatus = checkSecretsStatus();

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

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="mapping">Mapeamento</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status das Configurações
              </CardTitle>
              <CardDescription>
                Verificação dos secrets e configurações necessárias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status dos Secrets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
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

              {(!secretsStatus.pipedrive || !secretsStatus.discord) && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Alguns secrets não estão configurados. Configure-os nas configurações do projeto.
                  </AlertDescription>
                </Alert>
              )}

              {/* Status da Implementação */}
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Status da Implementação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tabela implementation_requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Edge Function criada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Modal implementado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Mapeamento do Pipedrive
              </CardTitle>
              <CardDescription>
                Descubra pipelines, stages e campos da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Mapear Configurações
                  </>
                )}
              </Button>

              {pipedriveMapping && (
                <div className="space-y-4">
                  {/* Pipeline Inside Sales */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Pipeline "Inside Sales"</h4>
                    {pipedriveMapping.account_info?.inside_sales_pipeline ? (
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ✅ Encontrado: {pipedriveMapping.account_info.inside_sales_pipeline.name}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          ID: {pipedriveMapping.account_info.inside_sales_pipeline.id}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        ❌ Pipeline "Inside Sales" não encontrado
                      </Badge>
                    )}
                  </div>

                  {/* Stage Qualificado */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Stage "Qualificado"</h4>
                    {pipedriveMapping.account_info?.qualificado_stage ? (
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          ✅ Encontrado: {pipedriveMapping.account_info.qualificado_stage.name}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          ID: {pipedriveMapping.account_info.qualificado_stage.id}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        ❌ Stage "Qualificado" não encontrado
                      </Badge>
                    )}
                  </div>

                  {/* Todos os Pipelines */}
                  {pipedriveMapping.account_info?.pipelines && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Todos os Pipelines</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {pipedriveMapping.account_info.pipelines.map((pipeline: any) => (
                          <div key={pipeline.id} className="text-sm flex justify-between">
                            <span>{pipeline.name}</span>
                            <span className="text-muted-foreground">ID: {pipeline.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuração Recomendada */}
                  {pipedriveMapping.recommended_config && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold mb-2">Configuração Recomendada</h4>
                      <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
{JSON.stringify(pipedriveMapping.recommended_config, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Teste de Integração
              </CardTitle>
              <CardDescription>
                Teste a criação de deal no Pipedrive e notificação no Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dados de Teste */}
              <div className="space-y-3">
                <h4 className="font-semibold">Dados para Teste</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Solução</label>
                    <Input
                      value={testData.solutionTitle}
                      onChange={(e) => setTestData(prev => ({ ...prev, solutionTitle: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Input
                      value={testData.solutionCategory}
                      onChange={(e) => setTestData(prev => ({ ...prev, solutionCategory: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nome do Usuário</label>
                    <Input
                      value={testData.userName}
                      onChange={(e) => setTestData(prev => ({ ...prev, userName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={testData.userEmail}
                      onChange={(e) => setTestData(prev => ({ ...prev, userEmail: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Telefone</label>
                    <Input
                      value={testData.userPhone}
                      onChange={(e) => setTestData(prev => ({ ...prev, userPhone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={testPipedriveIntegration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Executar Teste Completo
                  </>
                )}
              </Button>

              {/* Resultados dos Testes */}
              {Object.keys(testResults).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Resultados</h4>
                  
                  {testResults.database && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Banco de Dados</span>
                        {testResults.database.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {testResults.database.requestId && (
                        <p className="text-sm text-muted-foreground">
                          ID: {testResults.database.requestId}
                        </p>
                      )}
                    </div>
                  )}

                  {testResults.pipedrive && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">Pipedrive</span>
                        {testResults.pipedrive.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {testResults.pipedrive.dealId && (
                        <p className="text-sm text-muted-foreground">
                          Deal ID: {testResults.pipedrive.dealId}
                        </p>
                      )}
                      {testResults.pipedrive.error && (
                        <p className="text-sm text-red-600">
                          Erro: {testResults.pipedrive.error}
                        </p>
                      )}
                    </div>
                  )}

                  {testResults.discord && (
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">Discord</span>
                        {testResults.discord.sent ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {testResults.discord.sent ? 'Notificação enviada' : 'Falha no envio'}
                      </p>
                    </div>
                  )}
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
                <Database className="h-5 w-5" />
                Logs e Solicitações
              </CardTitle>
              <CardDescription>
                Visualize as solicitações criadas e logs da edge function
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.open('https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/process-implementation-request/logs', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Logs da Edge Function
                </Button>
                <Button 
                  onClick={() => window.open('https://supabase.com/dashboard/project/zotzvtepvpnkcoobdubt/functions/debug-pipedrive-mapping/logs', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Logs de Mapeamento
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Próximos passos após os testes:</strong><br />
                  1. Verificar se pipeline/stage estão corretos<br />
                  2. Ajustar campos personalizados se necessário<br />
                  3. Configurar responsável padrão no Pipedrive<br />
                  4. Remover função de debug em produção
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsDebugPage;