import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Send, 
  FileText, 
  Bug,
  Loader2,
  AlertTriangle,
  Wifi,
  TestTube,
  Key,
  Phone,
  Building,
  Search,
  Clock,
  Shield
} from 'lucide-react';
import { JsonViewer } from '@/components/debug/JsonViewer';
import { StatusCard } from '@/components/debug/StatusCard';
import { LogsViewer } from '@/components/debug/LogsViewer';

interface ConfigStatus {
  hasToken: boolean;
  hasPhoneNumberId: boolean;
  hasBusinessId: boolean;
  tokenLength: number;
  phoneNumberIdLength: number;
  businessIdLength: number;
  tokenMasked: string | null;
  phoneNumberIdMasked: string | null;
  businessIdMasked: string | null;
  currentBusinessId: string;
  discoveredBusinessId: string | null;
  autoDiscoveryWorked: boolean;
  needsBusinessIdUpdate: boolean;
}

interface ConnectivityTest {
  name: string;
  success: boolean;
  status?: number;
  data?: any;
  latency?: string;
  error?: string;
  scopes?: string[];
}

interface TemplatesData {
  success: boolean;
  businessId: string;
  templates: any[];
  fromCache?: boolean;
  fallback?: boolean;
  message: string;
}

const WhatsAppDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [connectivity, setConnectivity] = useState<{
    success: boolean;
    tests: ConnectivityTest[];
    summary: { total: number; passed: number; failed: number };
  } | null>(null);
  const [templatesData, setTemplatesData] = useState<TemplatesData | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('hello_world');
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const clearLogs = () => setLogs([]);

  const checkConfiguration = async () => {
    setLoading(true);
    addLog('🔍 Verificando configuração e descobrindo Business ID...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check-config' }
      });

      if (error) throw error;

      if (data?.success) {
        setConfig(data.config || null);
        addLog('✅ Configuração verificada com sucesso');
        
        if (data.config?.autoDiscoveryWorked) {
          addLog(`🎉 Business ID descoberto automaticamente: ${data.config.discoveredBusinessId}`);
        }
        
        if (data.config?.needsBusinessIdUpdate) {
          addLog('⚠️ Business ID configurado difere do descoberto');
        }
        
        toast.success('Configuração verificada');
      } else {
        throw new Error(data?.message || 'Erro na verificação');
      }
    } catch (error: any) {
      addLog(`❌ Erro na verificação: ${error?.message || 'Erro desconhecido'}`);
      toast.error('Erro ao verificar configuração');
      console.error('Erro detalhado:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnectivity = async () => {
    setLoading(true);
    addLog('🌐 Executando testes avançados de conectividade...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test-connectivity' }
      });

      if (error) throw error;

      setConnectivity(data || null);
      
      if (data?.success) {
        addLog(`✅ Conectividade OK - ${data.summary?.passed || 0}/${data.summary?.total || 0} testes passaram`);
        toast.success('Todos os testes de conectividade passaram');
      } else {
        addLog(`❌ Problemas de conectividade - ${data?.summary?.failed || 0}/${data?.summary?.total || 0} testes falharam`);
        toast.error('Alguns testes de conectividade falharam');
      }
    } catch (error: any) {
      addLog(`❌ Erro no teste: ${error?.message || 'Erro desconhecido'}`);
      toast.error('Erro ao testar conectividade');
      console.error('Erro detalhado:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoDiscoverTemplates = async () => {
    setLoading(true);
    addLog('🔍 Descobrindo Business ID e carregando templates automaticamente...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'auto-discover' }
      });

      if (error) throw error;

      if (data?.success) {
        setTemplatesData(data);
        
        const templatesCount = data.templates?.length || 0;
        
        if (data.fromCache) {
          addLog(`📦 Templates carregados do cache (${templatesCount} encontrados)`);
        } else if (data.fallback) {
          addLog(`🔄 Usando Business ID configurado como fallback (${templatesCount} templates)`);
        } else {
          addLog(`✅ Business ID descoberto automaticamente: ${data.businessId || 'N/A'} (${templatesCount} templates)`);
        }
        
        toast.success(`${templatesCount} templates carregados`);
      } else {
        addLog(`❌ Erro na descoberta automática: ${data?.message || 'Erro desconhecido'}`);
        toast.error(data?.message || 'Erro ao descobrir templates');
      }
    } catch (error: any) {
      addLog(`❌ Erro na descoberta: ${error?.message || 'Erro desconhecido'}`);
      toast.error('Erro ao descobrir templates');
      console.error('Erro detalhado:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone) {
      toast.error('Insira um número de telefone');
      return;
    }

    setLoading(true);
    addLog(`📱 Enviando mensagem de teste para ${testPhone} com template ${selectedTemplate}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'send-test',
          phone: testPhone,
          templateName: selectedTemplate
        }
      });

      if (error) throw error;

      setTestResult(data || null);
      
      if (data?.success) {
        addLog(`✅ Mensagem enviada com sucesso (${data.templateUsed || selectedTemplate} para ${data.phoneFormatted || testPhone})`);
        toast.success('Mensagem enviada!');
      } else {
        addLog(`❌ Erro no envio: ${data?.message || 'Erro desconhecido'} (Template: ${data?.templateUsed || selectedTemplate})`);
        toast.error(data?.message || 'Erro ao enviar mensagem');
      }
    } catch (error: any) {
      addLog(`❌ Erro no envio: ${error?.message || 'Erro desconhecido'}`);
      toast.error('Erro ao enviar teste');
      console.error('Erro detalhado:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean, warning = false) => {
    if (warning) return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    return success ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
          <div className="p-2 bg-viverblue/20 rounded-lg">
            <Bug className="h-8 w-8 text-viverblue" />
          </div>
          WhatsApp Debug Center
        </h1>
        <p className="text-slate-300 text-lg mt-2">
          Diagnóstico inteligente e automático da integração WhatsApp Business API
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700 h-auto p-1">
          <TabsTrigger 
            value="config" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger 
            value="connectivity" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Conectividade</span>
            <span className="sm:hidden">API</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">TPL</span>
          </TabsTrigger>
          <TabsTrigger 
            value="test" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Envio Teste</span>
            <span className="sm:hidden">Teste</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuração */}
        <TabsContent value="config" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-viverblue" />
                Verificação Inteligente de Configuração
              </CardTitle>
              <CardDescription className="text-slate-300">
                Verifica variáveis de ambiente e descobre automaticamente o Business ID correto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={checkConfiguration} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Analisando Configuração...' : 'Analisar Configuração'}
              </Button>

              {config && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatusCard
                      title="Access Token"
                      success={config.hasToken}
                      value={config.hasToken ? `${config.tokenLength} chars` : 'Não configurado'}
                      icon={<Key className="h-4 w-4" />}
                    />

                    <StatusCard
                      title="Phone Number ID"
                      success={config.hasPhoneNumberId}
                      value={config.hasPhoneNumberId ? `${config.phoneNumberIdLength} chars` : 'Não configurado'}
                      icon={<Phone className="h-4 w-4" />}
                    />

                    <StatusCard
                      title="Business ID Discovery"
                      success={config.autoDiscoveryWorked}
                      value={config.autoDiscoveryWorked ? 'Descoberto Automaticamente' : 'Falha na Descoberta'}
                      icon={<Building className="h-4 w-4" />}
                      warning={config.needsBusinessIdUpdate}
                    />
                  </div>

                  {config.autoDiscoveryWorked && (
                    <Alert className="border-emerald-500/30 bg-emerald-500/5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <AlertDescription className="text-slate-200">
                        <strong className="text-emerald-400">Business ID descoberto automaticamente!</strong><br />
                        <span className="text-slate-300">
                          ID Descoberto: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-300">{config.discoveredBusinessId}</code><br />
                          {config.needsBusinessIdUpdate && (
                            <>
                              ID Configurado: <code className="bg-slate-800 px-2 py-1 rounded text-amber-300">{config.currentBusinessId}</code><br />
                              <strong className="text-amber-400">Considere atualizar a variável de ambiente WHATSAPP_BUSINESS_ID</strong>
                            </>
                          )}
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {!config.autoDiscoveryWorked && config.hasToken && (
                    <Alert className="border-amber-500/30 bg-amber-500/5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-slate-200">
                        <strong className="text-amber-400">Não foi possível descobrir o Business ID automaticamente.</strong><br />
                        <span className="text-slate-300">
                          Isso pode indicar problemas de permissão no token ou configuração da conta.<br />
                          Verifique se o token tem as permissões necessárias para acessar informações de negócio.
                        </span>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conectividade */}
        <TabsContent value="connectivity" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Wifi className="h-5 w-5 text-viverblue" />
                Teste Avançado de Conectividade
              </CardTitle>
              <CardDescription className="text-slate-300">
                Testa conexão, permissões, latência e validação de tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={testConnectivity} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Executando Testes...' : 'Executar Testes de Conectividade'}
              </Button>

              {connectivity && (
                <div className="space-y-4">
                  {/* Resumo */}
                  <div className="grid grid-cols-3 gap-4">
                    <StatusCard
                      title="Total de Testes"
                      success={true}
                      value={connectivity.summary.total.toString()}
                      icon={<TestTube className="h-4 w-4" />}
                    />
                    <StatusCard
                      title="Testes Aprovados"
                      success={connectivity.summary.passed > 0}
                      value={connectivity.summary.passed.toString()}
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <StatusCard
                      title="Testes Falharam"
                      success={connectivity.summary.failed === 0}
                      value={connectivity.summary.failed.toString()}
                      icon={<XCircle className="h-4 w-4" />}
                    />
                  </div>

                  {/* Detalhes dos testes */}
                  <div className="space-y-3">
                    {connectivity.tests.map((test, index) => (
                      <div key={index} className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.success)}
                            <span className="font-medium text-slate-200">{test.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {test.latency && (
                              <Badge variant="outline" className="border-viverblue text-viverblue">
                                <Clock className="w-3 h-3 mr-1" />
                                {test.latency}
                              </Badge>
                            )}
                            {test.status && (
                              <Badge variant={test.success ? "default" : "destructive"}>
                                {test.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {test.scopes && Array.isArray(test.scopes) && test.scopes.length > 0 && (
                          <div className="text-sm text-slate-400 mb-2">
                            <span className="font-medium">Permissões:</span> {test.scopes.join(', ')}
                          </div>
                        )}
                        
                        {test.error && (
                          <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                            <strong>Erro:</strong> {test.error}
                          </div>
                        )}
                        
                        {test.data && (
                          <JsonViewer data={test.data} title="Dados da Resposta" className="mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Search className="h-5 w-5 text-viverblue" />
                Descoberta Automática de Templates
              </CardTitle>
              <CardDescription className="text-slate-300">
                Descobre automaticamente o Business ID correto e lista todos os templates disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={autoDiscoverTemplates} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Descobrindo Templates...' : 'Descobrir Templates Automaticamente'}
              </Button>

              {templatesData && (
                <div className="space-y-4">
                  <Alert className="border-emerald-500/30 bg-emerald-500/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <AlertDescription className="text-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-emerald-400">Business ID:</strong> {templatesData.businessId}<br />
                          <strong className="text-emerald-400">Templates encontrados:</strong> {templatesData.templates.length}
                        </div>
                        <div className="flex items-center gap-2">
                          {templatesData.fromCache && (
                            <Badge variant="outline" className="border-blue-400 text-blue-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Cache
                            </Badge>
                          )}
                          {templatesData.fallback && (
                            <Badge variant="outline" className="border-amber-400 text-amber-400">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Fallback
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {templatesData.templates.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-white">Templates Disponíveis:</h4>
                      <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {templatesData.templates.map((template, index) => (
                          <div key={index} className="p-4 border border-slate-600 rounded-lg bg-slate-800/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-slate-200">{template.name}</span>
                              <Badge variant={template.status === 'APPROVED' ? 'default' : 'destructive'}>
                                {template.status}
                              </Badge>
                            </div>
                            {template.category && (
                              <p className="text-sm text-slate-400 mb-1">
                                <strong>Categoria:</strong> {template.category}
                              </p>
                            )}
                            {template.language && (
                              <p className="text-sm text-slate-400">
                                <strong>Idioma:</strong> {template.language}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teste de Envio */}
        <TabsContent value="test" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-viverblue" />
                Teste de Envio de Mensagem
              </CardTitle>
              <CardDescription className="text-slate-300">
                Envia uma mensagem de teste usando os templates disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone" className="text-slate-200">
                    Número de Telefone (Brasil)
                  </Label>
                  <Input
                    id="testPhone"
                    placeholder="(11) 99999-9999"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template" className="text-slate-200">
                    Template
                  </Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="hello_world">Hello World</SelectItem>
                      <SelectItem value="convite_acesso">Convite de Acesso</SelectItem>
                      {templatesData?.templates?.filter(t => t?.status === 'APPROVED')?.map((template) => (
                        <SelectItem key={template?.name || Math.random()} value={template?.name || ''}>
                          {template?.name || 'Template sem nome'}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={sendTestMessage} 
                disabled={loading || !testPhone}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Enviando Teste...' : 'Enviar Mensagem de Teste'}
              </Button>

              {testResult && (
                <Alert className={testResult.success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}>
                  {getStatusIcon(testResult.success)}
                  <AlertDescription className="text-slate-200">
                    <div className="space-y-2">
                      <div>
                        <strong>Status:</strong> {testResult.success ? 'Sucesso' : 'Erro'}<br />
                        <strong>Template:</strong> {testResult.templateUsed}<br />
                        <strong>Telefone:</strong> {testResult.phoneFormatted}
                      </div>
                      
                      {testResult.result && (
                        <JsonViewer data={testResult.result} title="Resposta da API" />
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logs */}
      <LogsViewer logs={logs} onClear={clearLogs} />
    </div>
  );
};

export default WhatsAppDebug;