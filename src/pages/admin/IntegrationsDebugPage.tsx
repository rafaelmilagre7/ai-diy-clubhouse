import React, { useState, useEffect } from 'react';
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
  TestTube,
  Search,
  Target,
  GitBranch,
  Tag,
  User,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StatusCard } from '@/components/debug/StatusCard';

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
              {/* Botão para verificar secrets */}
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
                    Verificar Status dos Secrets
                  </>
                )}
              </Button>

              {/* Status dos Secrets - só mostrar após verificação */}
              {secretsStatus && (
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
              )}

              {secretsStatus && secretsStatus.pipedrive !== undefined && (!secretsStatus.pipedrive || !secretsStatus.discord) && (
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
                <Database className="h-5 w-5" />
                Mapeamento Completo do Pipedrive
              </CardTitle>
              <CardDescription>
                Descubra toda a estrutura da sua conta Pipedrive
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
                    <Search className="h-4 w-4 mr-2" />
                    Mapear Conta Completa
                  </>
                )}
              </Button>

              {/* Resultados do Mapeamento */}
              {pipedriveMapping && (
                <div className="space-y-6">
                  
                  {/* Resumo da Conta */}
                  {pipedriveMapping.account_summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{pipedriveMapping.account_summary.total_pipelines}</div>
                        <div className="text-sm text-gray-600">Pipelines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{pipedriveMapping.account_summary.total_stages}</div>
                        <div className="text-sm text-gray-600">Stages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{pipedriveMapping.account_summary.total_deal_fields}</div>
                        <div className="text-sm text-gray-600">Campos Deals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{pipedriveMapping.account_summary.total_users}</div>
                        <div className="text-sm text-gray-600">Usuários</div>
                      </div>
                    </div>
                  )}

                  {/* Configuração Alvo - Inside Sales */}
                  {pipedriveMapping.target_setup && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Configuração Alvo - Inside Sales
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatusCard
                          title='Pipeline "Inside Sales"'
                          success={pipedriveMapping.target_setup.found_target_pipeline}
                          value={pipedriveMapping.target_setup.found_target_pipeline ? "Encontrado" : "Não encontrado"}
                          icon={<Database className="h-4 w-4" />}
                        />
                        <StatusCard
                          title='Stage "Qualificado"'
                          success={pipedriveMapping.target_setup.found_target_stage}
                          value={pipedriveMapping.target_setup.found_target_stage ? "Encontrado" : "Não encontrado"}
                          icon={<CheckCircle className="h-4 w-4" />}
                        />
                      </div>
                      
                      {pipedriveMapping.target_setup.setup_complete && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Configuração completa! Pronto para implementação.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pipelines e Stages */}
                  {pipedriveMapping.structures?.pipelines && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Todos os Pipelines ({pipedriveMapping.structures.pipelines.length})
                      </h3>
                      <div className="space-y-3">
                        {pipedriveMapping.structures.pipelines.map((pipeline: any) => {
                          const pipelineStages = pipedriveMapping.structures?.all_stages?.filter(
                            (stage: any) => stage.pipeline_id === pipeline.id
                          ) || [];
                          
                          return (
                            <div key={pipeline.id} className="border rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{pipeline.name}</h4>
                                <span className="text-sm text-gray-500">{pipelineStages.length} stages</span>
                              </div>
                              {pipelineStages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {pipelineStages.map((stage: any) => (
                                    <span 
                                      key={stage.id} 
                                      className={`px-2 py-1 text-xs rounded ${
                                        stage.name === 'Qualificado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {stage.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Campos Personalizados */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Campos de Deals */}
                    {pipedriveMapping.custom_fields?.deal_fields && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Campos de Deals ({pipedriveMapping.custom_fields.deal_fields.length})
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {pipedriveMapping.custom_fields.deal_fields.map((field: any) => (
                            <div key={field.id} className="flex justify-between items-center p-2 border rounded text-sm">
                              <div>
                                <div className="font-medium">{field.name}</div>
                                <div className="text-gray-500">{field.field_type}</div>
                              </div>
                              {field.mandatory_flag && (
                                <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Campos de Pessoas */}
                    {pipedriveMapping.custom_fields?.person_fields && (
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Campos de Pessoas ({pipedriveMapping.custom_fields.person_fields.length})
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {pipedriveMapping.custom_fields.person_fields.map((field: any) => (
                            <div key={field.id} className="flex justify-between items-center p-2 border rounded text-sm">
                              <div>
                                <div className="font-medium">{field.name}</div>
                                <div className="text-gray-500">{field.field_type}</div>
                              </div>
                              {field.mandatory_flag && (
                                <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usuários */}
                  {pipedriveMapping.structures?.users && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Usuários Disponíveis ({pipedriveMapping.structures.users.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pipedriveMapping.structures.users.map((user: any) => (
                          <div key={user.id} className="p-3 border rounded">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.is_admin && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                Admin
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Configuração Recomendada */}
                  {pipedriveMapping.implementation_config && (
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configuração Recomendada para Implementação
                      </h3>
                      
                      {/* Avisos */}
                      {pipedriveMapping.implementation_config.missing_config?.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Atenção:</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {pipedriveMapping.implementation_config.missing_config.map((issue: string, index: number) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <pre className="text-sm text-green-400 bg-gray-900 p-3 rounded border border-gray-700 overflow-x-auto">
{JSON.stringify(pipedriveMapping.implementation_config, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Dados Brutos (Collapsible) */}
                  <details className="border rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50">
                      📊 Ver Dados Brutos Completos
                    </summary>
                    <div className="p-4 border-t bg-gray-50">
                      <pre className="text-xs text-green-400 bg-gray-900 p-3 rounded border border-gray-700 overflow-auto max-h-96">
                        {JSON.stringify(pipedriveMapping, null, 2)}
                      </pre>
                    </div>
                  </details>
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