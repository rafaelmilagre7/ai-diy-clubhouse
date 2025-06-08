import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare,
  TestTube
} from 'lucide-react';

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bug className="h-6 w-6" />
          WhatsApp Debug
        </h1>
        <p className="text-muted-foreground">
          Diagnóstico e teste da integração WhatsApp Business API
        </p>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Conectividade
          </TabsTrigger>
          <TabsTrigger value="business-test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Business IDs
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Teste
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Configuração</CardTitle>
              <CardDescription>
                Verifica se as variáveis de ambiente estão configuradas corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={checkConfiguration} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar Configuração
              </Button>

              {config && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Access Token</span>
                    <div className="flex items-center gap-2">
                      {config.hasToken ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={config.hasToken ? "default" : "destructive"}>
                        {config.hasToken ? `${config.tokenLength} chars` : 'Não configurado'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Phone Number ID</span>
                    <div className="flex items-center gap-2">
                      {config.hasPhoneNumberId ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={config.hasPhoneNumberId ? "default" : "destructive"}>
                        {config.hasPhoneNumberId ? `${config.phoneNumberIdLength} chars` : 'Não configurado'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Business ID</span>
                    <div className="flex items-center gap-2">
                      {config.hasBusinessId ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={config.hasBusinessId ? "default" : "destructive"}>
                        {config.hasBusinessId ? `${config.businessIdLength} chars` : 'Não configurado'}
                      </Badge>
                    </div>
                  </div>

                  {config.currentBusinessId !== config.suggestedBusinessId && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Business ID pode estar incorreto!</strong><br />
                        Atual: {config.currentBusinessId}<br />
                        Sugerido (do print): {config.suggestedBusinessId}<br />
                        <strong>Execute o teste de Business IDs para confirmar.</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Business IDs</CardTitle>
              <CardDescription>
                Testa diferentes Business IDs para encontrar o correto para templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testBusinessIds} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Testar Business IDs
              </Button>

              {businessIdTests.length > 0 && (
                <div className="space-y-3">
                  {businessIdTests.map((test, index) => (
                    <div key={index} className="p-3 border rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{test.label}</span>
                        <div className="flex items-center gap-2">
                          {test.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={test.success ? "default" : "destructive"}>
                            {test.success ? `${test.templatesFound} templates` : 'Erro'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Business ID: {test.businessId}
                      </p>
                      {test.error && (
                        <p className="text-sm text-red-600">
                          Erro: {test.error.message || test.error}
                        </p>
                      )}
                      {test.success && test.templatesFound > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => listTemplates(test.businessId)}
                          disabled={loading}
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

        <TabsContent value="connectivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conectividade</CardTitle>
              <CardDescription>
                Testa a conexão com a API do WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testConnectivity} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Testar Conectividade
              </Button>

              {connectivity && (
                <Alert>
                  {connectivity.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    Status: {connectivity.status} - {connectivity.message}
                    {connectivity.data && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(connectivity.data, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates do WhatsApp</CardTitle>
              <CardDescription>
                Lista os templates aprovados no WhatsApp Business (usando Business ID)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => listTemplates()} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Carregar Templates
              </Button>

              {templates.length > 0 && (
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <div key={index} className="p-3 border rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{template.name}</span>
                        <Badge variant={template.status === 'APPROVED' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Idioma: {template.language} | Categoria: {template.category}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Envio de Teste</CardTitle>
              <CardDescription>
                Envia mensagens de teste para validar a integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testPhone">Número de Telefone (formato: 5511999999999)</Label>
                <Input
                  id="testPhone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="5511999999999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateSelect">Template</Label>
                <select 
                  id="templateSelect"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="convite_acesso">convite_acesso</option>
                  <option value="hello_world">hello_world</option>
                </select>
              </div>

              <Button 
                onClick={sendTestMessage} 
                disabled={loading || !testPhone}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Teste
              </Button>

              {testResult && (
                <Alert>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {testResult.message}
                    {testResult.result && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(testResult.result, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Logs de Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={logs.join('\n')}
            readOnly
            className="h-32 font-mono text-xs"
            placeholder="Os logs aparecerão aqui..."
          />
          {logs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setLogs([])}
            >
              Limpar Logs
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppDebug;
