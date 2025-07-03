
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusCard } from '@/components/debug/StatusCard';
import { JsonViewer } from '@/components/debug/JsonViewer';
import { AdvancedLogsViewer } from '@/components/debug/AdvancedLogsViewer';
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  MessageSquare, 
  Zap,
  Shield,
  Smartphone,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  Bug,
  Globe,
  Key
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConfigTestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  category?: 'config' | 'connectivity' | 'templates' | 'permissions';
}

interface BusinessAccount {
  id: string;
  name: string;
  verification_status: string;
}

interface AdvancedConfigCheck {
  tokenAnalysis: {
    type: string;
    expiresAt?: string;
    permissions: string[];
    missingPermissions: string[];
  };
  businessDiscovery: {
    strategies: Array<{
      name: string;
      success: boolean;
      businessId?: string;
      accounts?: BusinessAccount[];
      error?: string;
    }>;
    recommendedBusinessId?: string;
  };
  connectivityTests: ConfigTestResult[];
  templates: {
    available: any[];
    approved: number;
    pending: number;
    rejected: number;
  };
}

const WhatsAppDebug: React.FC = () => {
  const [config, setConfig] = useState({
    token: '',
    businessId: '',
    phoneNumberId: '',
    webhookToken: ''
  });
  
  const [testResults, setTestResults] = useState<ConfigTestResult[]>([]);
  const [advancedResults, setAdvancedResults] = useState<AdvancedConfigCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  // Carregar configuração salva
  useEffect(() => {
    loadSavedConfig();
  }, []);

  const addLog = (message: string, category: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] [${category.toUpperCase()}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const loadSavedConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'whatsapp_config')
        .single();

      if (data && !error) {
        const savedConfig = JSON.parse(data.setting_value);
        setConfig(savedConfig);
        addLog('Configuração carregada do banco de dados', 'success');
      }
    } catch (error) {
      addLog(`Erro ao carregar configuração: ${error}`, 'error');
    }
  };

  const saveConfig = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'whatsapp_config',
          setting_value: JSON.stringify(config)
        });

      if (error) throw error;
      
      addLog('Configuração salva com sucesso', 'success');
      toast.success('Configuração salva!');
    } catch (error) {
      addLog(`Erro ao salvar configuração: ${error}`, 'error');
      toast.error('Erro ao salvar configuração');
    }
  };

  const runBasicTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    addLog('Iniciando testes básicos de conectividade', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'basic_test',
          config 
        }
      });

      if (error) throw error;

      setTestResults(data.results || []);
      
      data.results?.forEach((result: ConfigTestResult) => {
        const status = result.success ? 'success' : 'error';
        addLog(`${result.test}: ${result.message}`, status);
      });

    } catch (error) {
      addLog(`Erro nos testes básicos: ${error}`, 'error');
      toast.error('Erro ao executar testes básicos');
    } finally {
      setIsLoading(false);
    }
  };

  const runAdvancedDiagnostics = async () => {
    setIsLoading(true);
    setAdvancedResults(null);
    addLog('Iniciando diagnósticos avançados', 'info');

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'advanced_diagnostics',
          config 
        }
      });

      if (error) throw error;

      setAdvancedResults(data);
      addLog('Diagnósticos avançados concluídos', 'success');

      // Log dos resultados detalhados
      if (data.tokenAnalysis) {
        addLog(`Token Type: ${data.tokenAnalysis.type}`, 'info');
        addLog(`Permissões disponíveis: ${data.tokenAnalysis.permissions.join(', ')}`, 'info');
        if (data.tokenAnalysis.missingPermissions.length > 0) {
          addLog(`Permissões em falta: ${data.tokenAnalysis.missingPermissions.join(', ')}`, 'warning');
        }
      }

      if (data.businessDiscovery?.recommendedBusinessId) {
        addLog(`Business ID recomendado: ${data.businessDiscovery.recommendedBusinessId}`, 'success');
      }

    } catch (error) {
      addLog(`Erro nos diagnósticos avançados: ${error}`, 'error');
      toast.error('Erro ao executar diagnósticos avançados');
    } finally {
      setIsLoading(false);
    }
  };

  const testManualBusinessId = async (businessId: string) => {
    addLog(`Testando Business ID manual: ${businessId}`, 'info');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test_business_id',
          config: { ...config, businessId }
        }
      });

      if (error) throw error;

      if (data.success) {
        addLog(`Business ID ${businessId} validado com sucesso`, 'success');
        setConfig(prev => ({ ...prev, businessId }));
        toast.success('Business ID válido!');
      } else {
        addLog(`Business ID ${businessId} inválido: ${data.message}`, 'error');
        toast.error('Business ID inválido');
      }
    } catch (error) {
      addLog(`Erro ao testar Business ID: ${error}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs limpos', 'info');
  };

  const renderTokenAnalysis = () => {
    if (!advancedResults?.tokenAnalysis) return null;

    const { tokenAnalysis } = advancedResults;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Análise do Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusCard
              title="Tipo do Token"
              success={tokenAnalysis.type === 'page'}
              value={tokenAnalysis.type}
              icon={<Shield className="h-4 w-4" />}
            />
            
            {tokenAnalysis.expiresAt && (
              <StatusCard
                title="Expira em"
                success={new Date(tokenAnalysis.expiresAt) > new Date()}
                value={new Date(tokenAnalysis.expiresAt).toLocaleDateString()}
                icon={<AlertTriangle className="h-4 w-4" />}
              />
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-green-400">Permissões Disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {tokenAnalysis.permissions.map(permission => (
                <Badge key={permission} variant="secondary" className="bg-green-900/20 text-green-400">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          {tokenAnalysis.missingPermissions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-400">Permissões em Falta:</h4>
              <div className="flex flex-wrap gap-2">
                {tokenAnalysis.missingPermissions.map(permission => (
                  <Badge key={permission} variant="destructive">
                    {permission}
                  </Badge>
                ))}
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Algumas permissões necessárias estão faltando. Configure-as no Meta for Developers.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBusinessDiscovery = () => {
    if (!advancedResults?.businessDiscovery) return null;

    const { businessDiscovery } = advancedResults;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Descoberta de Business ID
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {businessDiscovery.recommendedBusinessId && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Business ID recomendado: <strong>{businessDiscovery.recommendedBusinessId}</strong>
                <Button 
                  size="sm" 
                  className="ml-2"
                  onClick={() => testManualBusinessId(businessDiscovery.recommendedBusinessId!)}
                >
                  Usar este ID
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Estratégias de Descoberta:</h4>
            {businessDiscovery.strategies.map((strategy, index) => (
              <StatusCard
                key={index}
                title={strategy.name}
                success={strategy.success}
                value={strategy.success ? 'Sucesso' : 'Falhou'}
                icon={strategy.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConnectivityTests = () => {
    if (!advancedResults?.connectivityTests) return null;

    const testsByCategory = advancedResults.connectivityTests.reduce((acc, test) => {
      const category = test.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(test);
      return acc;
    }, {} as Record<string, ConfigTestResult[]>);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Testes de Conectividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(testsByCategory).map(([category, tests]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold capitalize">{category}:</h4>
              <div className="grid gap-2">
                {tests.map((test, index) => (
                  <StatusCard
                    key={index}
                    title={test.test}
                    success={test.success}
                    value={test.success ? 'OK' : 'Erro'}
                    warning={test.message.includes('warning')}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-green-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Debug Center</h1>
          <p className="text-slate-400">Diagnóstico avançado e testes de conectividade</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Configuração Básica</TabsTrigger>
          <TabsTrigger value="advanced">Diagnósticos Avançados</TabsTrigger>
          <TabsTrigger value="manual">Testes Manuais</TabsTrigger>
          <TabsTrigger value="logs">Logs & Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do WhatsApp Business API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token de Acesso</Label>
                  <Input
                    id="token"
                    type="password"
                    value={config.token}
                    onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                    placeholder="Token da API do WhatsApp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessId">Business Account ID</Label>
                  <Input
                    id="businessId"
                    value={config.businessId}
                    onChange={(e) => setConfig(prev => ({ ...prev, businessId: e.target.value }))}
                    placeholder="ID da conta de negócios"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                  <Input
                    id="phoneNumberId"
                    value={config.phoneNumberId}
                    onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    placeholder="ID do número de telefone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookToken">Webhook Token</Label>
                  <Input
                    id="webhookToken"
                    value={config.webhookToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookToken: e.target.value }))}
                    placeholder="Token do webhook"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={saveConfig}>
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={runBasicTests}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Testar Conectividade
                </Button>
              </div>
            </CardContent>
          </Card>

          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes Básicos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {testResults.map((result, index) => (
                    <StatusCard
                      key={index}
                      title={result.test}
                      success={result.success}
                      value={result.success ? 'OK' : 'Erro'}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={runAdvancedDiagnostics}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bug className="h-4 w-4 mr-2" />
              )}
              Executar Diagnósticos Avançados
            </Button>
          </div>

          {advancedResults && (
            <div className="space-y-6">
              {renderTokenAnalysis()}
              {renderBusinessDiscovery()}
              {renderConnectivityTests()}
              
              {advancedResults.templates && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Templates de Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <StatusCard
                        title="Aprovados"
                        success={advancedResults.templates.approved > 0}
                        value={advancedResults.templates.approved.toString()}
                      />
                      <StatusCard
                        title="Pendentes"
                        success={advancedResults.templates.pending === 0}
                        value={advancedResults.templates.pending.toString()}
                        warning={advancedResults.templates.pending > 0}
                      />
                      <StatusCard
                        title="Rejeitados"
                        success={advancedResults.templates.rejected === 0}
                        value={advancedResults.templates.rejected.toString()}
                      />
                    </div>
                    
                    <JsonViewer 
                      data={advancedResults.templates.available} 
                      title="Templates Disponíveis"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testes Manuais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Testar Business ID Manualmente</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o Business ID para testar"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        testManualBusinessId(target.value);
                      }
                    }}
                  />
                  <Button 
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input?.value) testManualBusinessId(input.value);
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AdvancedLogsViewer 
            logs={logs} 
            onClear={clearLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppDebug;
