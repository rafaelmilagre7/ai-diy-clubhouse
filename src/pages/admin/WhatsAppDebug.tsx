import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
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
  Building
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
  suggestedBusinessId: string;
}

const WhatsAppDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [connectivity, setConnectivity] = useState<any>(null);
  const [businessIdTests, setBusinessIdTests] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('hello_world');
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const checkConfiguration = async () => {
    setLoading(true);
    addLog('Verificando configuração do WhatsApp...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check-config' }
      });

      if (error) throw error;

      if (data.success) {
        setConfig(data.config);
        addLog('✅ Configuração verificada com sucesso');
        toast.success('Configuração verificada');
      } else {
        throw new Error(data.message || 'Erro na verificação');
      }
    } catch (error: any) {
      addLog(`❌ Erro na verificação: ${error.message}`);
      toast.error('Erro ao verificar configuração');
    } finally {
      setLoading(false);
    }
  };

  const testConnectivity = async () => {
    setLoading(true);
    addLog('Testando conectividade com API do WhatsApp...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test-connectivity' }
      });

      if (error) throw error;

      setConnectivity(data);
      
      if (data.success) {
        addLog('✅ Conectividade OK com WhatsApp API');
        toast.success('Conectividade confirmada');
      } else {
        addLog(`❌ Erro de conectividade: Status ${data.status}`);
        toast.error('Erro de conectividade');
      }
    } catch (error: any) {
      addLog(`❌ Erro no teste: ${error.message}`);
      toast.error('Erro ao testar conectividade');
    } finally {
      setLoading(false);
    }
  };

  const testBusinessIds = async () => {
    setLoading(true);
    addLog('Testando diferentes Business IDs para templates...');
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test-business-ids' }
      });

      if (error) throw error;

      if (data.success) {
        setBusinessIdTests(data.results);
        addLog(`✅ Teste concluído. Business ID recomendado: ${data.recommendation || 'Nenhum funcionou'}`);
        toast.success('Teste de Business IDs concluído');
        
        if (data.recommendation) {
          toast.success(`Business ID recomendado: ${data.recommendation}`);
        }
      } else {
        addLog(`❌ Erro no teste: ${data.message}`);
        toast.error('Erro no teste de Business IDs');
      }
    } catch (error: any) {
      addLog(`❌ Erro no teste: ${error.message}`);
      toast.error('Erro ao testar Business IDs');
    } finally {
      setLoading(false);
    }
  };

  const listTemplates = async (businessIdToTest?: string) => {
    setLoading(true);
    addLog(`Buscando templates${businessIdToTest ? ` usando Business ID: ${businessIdToTest}` : ''}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'list-templates',
          businessIdToTest
        }
      });

      if (error) throw error;

      if (data.success) {
        setTemplates(data.templates);
        addLog(`✅ ${data.templates.length} templates encontrados (Business ID: ${data.businessIdUsed})`);
        toast.success(`${data.templates.length} templates carregados`);
      } else {
        addLog(`❌ Erro ao buscar templates: ${data.message} (Business ID: ${data.businessIdUsed})`);
        toast.error(data.message || 'Erro ao carregar templates');
      }
    } catch (error: any) {
      addLog(`❌ Erro ao buscar templates: ${error.message}`);
      toast.error('Erro ao carregar templates');
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
    addLog(`Enviando mensagem de teste para ${testPhone} com template ${selectedTemplate}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'send-test',
          phone: testPhone,
          templateName: selectedTemplate
        }
      });

      if (error) throw error;

      setTestResult(data);
      
      if (data.success) {
        addLog(`✅ Mensagem enviada com sucesso (${data.templateUsed} para ${data.phoneFormatted})`);
        toast.success('Mensagem enviada!');
      } else {
        addLog(`❌ Erro no envio: ${data.message} (Template: ${data.templateUsed})`);
        toast.error(data.message || 'Erro ao enviar mensagem');
      }
    } catch (error: any) {
      addLog(`❌ Erro no envio: ${error.message}`);
      toast.error('Erro ao enviar teste');
    } finally {
      setLoading(false);
    }
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
          Diagnóstico avançado e teste da integração WhatsApp Business API
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700 h-auto p-1">
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
            value="business-test" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Business IDs</span>
            <span className="sm:hidden">IDs</span>
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white text-slate-300 py-3"
          >
            <FileText className="h-4 w-4" />
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

        <TabsContent value="config" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-viverblue" />
                Verificação de Configuração
              </CardTitle>
              <CardDescription className="text-slate-300">
                Verifica se as variáveis de ambiente estão configuradas corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={checkConfiguration} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Verificando...' : 'Verificar Configuração'}
              </Button>

              {config && (
                <div className="space-y-4">
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
                    title="Business ID"
                    success={config.hasBusinessId}
                    value={config.hasBusinessId ? `${config.businessIdLength} chars` : 'Não configurado'}
                    icon={<Building className="h-4 w-4" />}
                    warning={config.currentBusinessId !== config.suggestedBusinessId}
                  />

                  {config.currentBusinessId !== config.suggestedBusinessId && (
                    <Alert className="border-amber-500/30 bg-amber-500/5">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-slate-200">
                        <strong className="text-amber-400">Business ID pode estar incorreto!</strong><br />
                        <span className="text-slate-300">
                          Atual: <code className="bg-slate-800 px-2 py-1 rounded text-amber-300">{config.currentBusinessId}</code><br />
                          Sugerido: <code className="bg-slate-800 px-2 py-1 rounded text-emerald-300">{config.suggestedBusinessId}</code><br />
                        </span>
                        <strong className="text-amber-400">Execute o teste de Business IDs para confirmar.</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-test" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <TestTube className="h-5 w-5 text-viverblue" />
                Teste de Business IDs
              </CardTitle>
              <CardDescription className="text-slate-300">
                Testa diferentes Business IDs para encontrar o correto para templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={testBusinessIds} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Testando IDs...' : 'Testar Business IDs'}
              </Button>

              {businessIdTests.length > 0 && (
                <div className="space-y-4">
                  {businessIdTests.map((test, index) => (
                    <div key={index} className="p-4 border border-slate-600 rounded-lg space-y-3 bg-slate-800/30">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200 text-base">{test.label}</span>
                        <div className="flex items-center gap-3">
                          {test.success ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <Badge variant={test.success ? "default" : "destructive"} className="font-medium">
                            {test.success ? `${test.templatesFound} templates` : 'Erro'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Business ID: <code className="bg-slate-700 px-2 py-1 rounded text-slate-200">{test.businessId}</code>
                      </p>
                      {test.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                          <strong>Erro:</strong> {test.error.message || test.error}
                        </div>
                      )}
                      {test.success && test.templatesFound > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => listTemplates(test.businessId)}
                          disabled={loading}
                          className="border-viverblue text-viverblue hover:bg-viverblue hover:text-white"
                        >
                          Ver Templates
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectivity" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Wifi className="h-5 w-5 text-viverblue" />
                Teste de Conectividade
              </CardTitle>
              <CardDescription className="text-slate-300">
                Testa a conexão com a API do WhatsApp Business e valida a resposta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={testConnectivity} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Testando Conexão...' : 'Testar Conectividade'}
              </Button>

              {connectivity && (
                <div className="space-y-4">
                  <Alert className={connectivity.success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}>
                    {connectivity.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <AlertDescription className="text-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Status HTTP:</span>
                        <Badge 
                          variant={connectivity.success ? "default" : "destructive"}
                          className="font-mono"
                        >
                          {connectivity.status}
                        </Badge>
                      </div>
                      <p className="text-sm">{connectivity.message}</p>
                    </AlertDescription>
                  </Alert>
                  
                  {connectivity.data && (
                    <JsonViewer 
                      data={connectivity.data} 
                      title="Resposta da API"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-viverblue" />
                Templates do WhatsApp
              </CardTitle>
              <CardDescription className="text-slate-300">
                Lista os templates aprovados no WhatsApp Business (usando Business ID correto)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={() => listTemplates()} 
                disabled={loading}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-3 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Carregando...' : 'Carregar Templates'}
              </Button>

              {templates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-slate-200">Templates Encontrados</h4>
                    <Badge variant="secondary" className="font-medium">
                      {templates.length} total
                    </Badge>
                  </div>
                  
                  {templates.map((template, index) => (
                    <div key={index} className="p-4 border border-slate-600 rounded-lg space-y-3 bg-slate-800/30">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200 text-base">{template.name}</span>
                        <Badge 
                          variant={template.status === 'APPROVED' ? 'default' : 'secondary'}
                          className={template.status === 'APPROVED' ? 'bg-emerald-600 text-emerald-100' : ''}
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Idioma: <code className="bg-slate-700 px-2 py-1 rounded text-slate-200">{template.language}</code></span>
                        <span>Categoria: <code className="bg-slate-700 px-2 py-1 rounded text-slate-200">{template.category}</code></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-viverblue" />
                Envio de Teste
              </CardTitle>
              <CardDescription className="text-slate-300">
                Envia mensagens de teste para validar a integração completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="testPhone" className="text-slate-200 font-medium">
                    Número de Telefone
                  </Label>
                  <Input
                    id="testPhone"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="5511999999999"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-base py-3"
                  />
                  <p className="text-xs text-slate-400">
                    Formato: código do país + DDD + número (ex: 5511999999999)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateSelect" className="text-slate-200 font-medium">
                    Template a Testar
                  </Label>
                  <select 
                    id="templateSelect"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white text-base"
                  >
                    <option value="convite_acesso">convite_acesso (Convites)</option>
                    <option value="hello_world">hello_world (Teste Básico)</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={sendTestMessage} 
                disabled={loading || !testPhone}
                className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium py-4 text-base disabled:opacity-50"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {loading ? 'Enviando Mensagem...' : 'Enviar Teste de WhatsApp'}
              </Button>

              {testResult && (
                <div className="space-y-4">
                  <Alert className={testResult.success ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}>
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <AlertDescription className="text-slate-200">
                      <p className="font-medium mb-2">{testResult.message}</p>
                      {testResult.templateUsed && (
                        <p className="text-sm text-slate-300">
                          Template utilizado: <code className="bg-slate-700 px-2 py-1 rounded">{testResult.templateUsed}</code>
                        </p>
                      )}
                      {testResult.phoneFormatted && (
                        <p className="text-sm text-slate-300">
                          Enviado para: <code className="bg-slate-700 px-2 py-1 rounded">{testResult.phoneFormatted}</code>
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  {testResult.result && (
                    <JsonViewer 
                      data={testResult.result} 
                      title="Resposta Completa da API"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LogsViewer 
        logs={logs} 
        onClear={() => setLogs([])} 
        className="mt-8"
      />
    </div>
  );
};

export default WhatsAppDebug;
