
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Settings,
  FileText,
  Activity,
  Zap,
  Clock,
  Shield,
  Globe,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigStatus {
  hasToken: boolean;
  hasPhoneId: boolean;
  hasBusinessId: boolean;
  hasWebhookToken: boolean;
  isValid: boolean;
  details: {
    tokenLength: number;
    phoneIdLength: number;
    businessIdLength: number;
    webhookTokenLength: number;
  };
}

interface ConnectionTest {
  success: boolean;
  message: string;
  details?: any;
}

interface Template {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: any[];
}

interface DebugLog {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  action: string;
  message: string;
  details?: any;
}

const WhatsAppDebug = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [isLoading, setIsLoading] = useState(false);
  
  // Status & Config
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  
  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  // Message Test
  const [testMessage, setTestMessage] = useState({
    phoneNumber: '',
    message: 'Teste de conectividade WhatsApp - ' + new Date().toLocaleString(),
    templateName: 'convitevia',
    userName: 'Usuário Teste'
  });
  
  // Debug Logs
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  
  // Health Check
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const addLog = (level: DebugLog['level'], action: string, message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      action,
      message,
      details
    };
    setDebugLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
    console.log(`[${level.toUpperCase()}] ${action}: ${message}`, details);
  };

  const checkConfiguration = async () => {
    setIsLoading(true);
    addLog('info', 'CONFIG_CHECK', 'Verificando configuração do WhatsApp...');
    
    try {
      const response = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setConfigStatus(response.data);
      addLog('success', 'CONFIG_CHECK', 'Configuração verificada com sucesso', response.data);
    } catch (error: any) {
      addLog('error', 'CONFIG_CHECK', `Erro: ${error.message}`, error);
      toast.error(`Erro ao verificar configuração: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    addLog('info', 'CONNECTION_TEST', 'Testando conectividade com WhatsApp API...');
    
    try {
      const response = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test_connection' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setConnectionTest(response.data);
      
      if (response.data.success) {
        addLog('success', 'CONNECTION_TEST', 'Conectividade confirmada', response.data);
        toast.success('Conectividade WhatsApp confirmada!');
      } else {
        addLog('error', 'CONNECTION_TEST', `Falha na conectividade: ${response.data.message}`, response.data);
        toast.error(`Falha na conectividade: ${response.data.message}`);
      }
    } catch (error: any) {
      addLog('error', 'CONNECTION_TEST', `Erro: ${error.message}`, error);
      toast.error(`Erro no teste de conectividade: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    setTemplatesLoading(true);
    addLog('info', 'LOAD_TEMPLATES', 'Carregando templates do WhatsApp...');
    
    try {
      const response = await supabase.functions.invoke('whatsapp-list-templates', {
        body: {}
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.success) {
        setTemplates(response.data.data.templates || []);
        addLog('success', 'LOAD_TEMPLATES', `${response.data.data.templates?.length || 0} templates carregados`, response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      addLog('error', 'LOAD_TEMPLATES', `Erro: ${error.message}`, error);
      toast.error(`Erro ao carregar templates: ${error.message}`);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const testTemplate = async () => {
    if (!testMessage.phoneNumber || !testMessage.userName) {
      toast.error('Preencha número e nome para testar template');
      return;
    }

    setIsLoading(true);
    addLog('info', 'TEMPLATE_TEST', `Testando template ${testMessage.templateName} para ${testMessage.phoneNumber}...`);
    
    try {
      const response = await supabase.functions.invoke('send-invite-whatsapp', {
        body: {
          inviteId: 'debug-test-' + Date.now(),
          whatsappNumber: testMessage.phoneNumber,
          roleId: 'debug-role-id',
          token: 'debug-token-' + Math.random().toString(36).substr(2, 9),
          userName: testMessage.userName,
          notes: 'Teste de template do WhatsApp Debug'
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        addLog('success', 'TEMPLATE_TEST', 'Template enviado com sucesso!', response.data);
        toast.success('Template enviado com sucesso!');
      } else {
        addLog('error', 'TEMPLATE_TEST', `Falha no envio: ${response.data?.message}`, response.data);
        toast.error(`Falha no envio: ${response.data?.message}`);
      }
    } catch (error: any) {
      addLog('error', 'TEMPLATE_TEST', `Erro: ${error.message}`, error);
      toast.error(`Erro no teste de template: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleMessage = async () => {
    if (!testMessage.phoneNumber || !testMessage.message) {
      toast.error('Preencha número e mensagem para testar');
      return;
    }

    setIsLoading(true);
    addLog('info', 'MESSAGE_TEST', `Testando mensagem simples para ${testMessage.phoneNumber}...`);
    
    try {
      const response = await supabase.functions.invoke('whatsapp-test', {
        body: {
          testNumber: testMessage.phoneNumber
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        addLog('success', 'MESSAGE_TEST', 'Teste de conectividade concluído', response.data);
        toast.success('Teste de conectividade concluído!');
      } else {
        addLog('error', 'MESSAGE_TEST', `Falha no teste: ${response.data?.message}`, response.data);
        toast.error(`Falha no teste: ${response.data?.message}`);
      }
    } catch (error: any) {
      addLog('error', 'MESSAGE_TEST', `Erro: ${error.message}`, error);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runFullDiagnostic = async () => {
    addLog('info', 'FULL_DIAGNOSTIC', 'Iniciando diagnóstico completo...');
    
    await checkConfiguration();
    await testConnection();
    await loadTemplates();
    
    addLog('success', 'FULL_DIAGNOSTIC', 'Diagnóstico completo finalizado');
    toast.success('Diagnóstico completo finalizado!');
  };

  const clearLogs = () => {
    setDebugLogs([]);
    addLog('info', 'LOGS_CLEARED', 'Logs limpos pelo usuário');
  };

  // Auto-load on mount
  useEffect(() => {
    checkConfiguration();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Debug</h1>
          <p className="text-muted-foreground">
            Centro de diagnósticos e testes da integração WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runFullDiagnostic}
            disabled={isLoading}
            variant="outline"
          >
            <Activity className="h-4 w-4 mr-2" />
            Diagnóstico Completo
          </Button>
          <Button 
            onClick={clearLogs}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="connectivity" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Conectividade
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração Geral
                </CardTitle>
                <CardDescription>
                  Status das variáveis de ambiente e configurações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {configStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WhatsApp Token:</span>
                      {getStatusBadge(configStatus.hasToken, configStatus.hasToken ? 'Configurado' : 'Não configurado')}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phone Number ID:</span>
                      {getStatusBadge(configStatus.hasPhoneId, configStatus.hasPhoneId ? 'Configurado' : 'Não configurado')}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Business ID:</span>
                      {getStatusBadge(configStatus.hasBusinessId, configStatus.hasBusinessId ? 'Configurado' : 'Não configurado')}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Webhook Token:</span>
                      {getStatusBadge(configStatus.hasWebhookToken, configStatus.hasWebhookToken ? 'Configurado' : 'Não configurado')}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>Token Length: {configStatus.details.tokenLength}</div>
                      <div>Phone ID Length: {configStatus.details.phoneIdLength}</div>
                      <div>Business ID Length: {configStatus.details.businessIdLength}</div>
                      <div>Webhook Length: {configStatus.details.webhookTokenLength}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={checkConfiguration} disabled={isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Verificar Configuração
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status da Integração
                </CardTitle>
                <CardDescription>
                  Informações em tempo real da API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectionTest ? (
                  <div className="space-y-3">
                    <Alert variant={connectionTest.success ? "default" : "destructive"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {connectionTest.message}
                      </AlertDescription>
                    </Alert>

                    {connectionTest.success && connectionTest.details && (
                      <div className="space-y-2 text-sm">
                        <div><strong>Número:</strong> {connectionTest.details.phoneNumber}</div>
                        <div><strong>Nome:</strong> {connectionTest.details.verifiedName}</div>
                        <div><strong>Phone ID:</strong> {connectionTest.details.phoneId}</div>
                        <div><strong>API Version:</strong> {connectionTest.details.apiVersion}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={testConnection} disabled={isLoading}>
                      <Globe className="h-4 w-4 mr-2" />
                      Testar Conectividade
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connectivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Teste de Conectividade Avançado
              </CardTitle>
              <CardDescription>
                Teste detalhado da conexão com a API do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testConnection} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isLoading ? 'Testando...' : 'Testar API WhatsApp'}
                </Button>

                <Button 
                  onClick={checkConfiguration} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isLoading ? 'Verificando...' : 'Verificar Config'}
                </Button>
              </div>

              {connectionTest && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Resultado do Teste:</h4>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(connectionTest, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Templates WhatsApp
              </CardTitle>
              <CardDescription>
                Gerenciar e testar templates aprovados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={loadTemplates} 
                  disabled={templatesLoading}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {templatesLoading ? 'Carregando...' : 'Carregar Templates'}
                </Button>

                <Button 
                  onClick={testTemplate} 
                  disabled={isLoading || !testMessage.phoneNumber || !testMessage.userName}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Testar Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Número de Teste</Label>
                  <Input
                    id="testPhone"
                    placeholder="(11) 99999-9999"
                    value={testMessage.phoneNumber}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testName">Nome da Pessoa</Label>
                  <Input
                    id="testName"
                    placeholder="João Silva"
                    value={testMessage.userName}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, userName: e.target.value }))}
                  />
                </div>
              </div>

              {templates.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Templates Disponíveis ({templates.length}):</h4>
                  <div className="grid gap-2">
                    {templates.slice(0, 5).map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.language} • {template.category} • {template.status}
                          </div>
                        </div>
                        <Badge variant={template.status === 'APPROVED' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </div>
                    ))}
                    {templates.length > 5 && (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        +{templates.length - 5} templates adicionais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Teste de Mensagens
              </CardTitle>
              <CardDescription>
                Enviar mensagens de teste e validar funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="messagePhone">Número WhatsApp</Label>
                  <Input
                    id="messagePhone"
                    placeholder="+55 11 99999-9999"
                    value={testMessage.phoneNumber}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageTemplate">Template</Label>
                  <Input
                    id="messageTemplate"
                    value={testMessage.templateName}
                    onChange={(e) => setTestMessage(prev => ({ ...prev, templateName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="messageText">Mensagem de Teste</Label>
                <Textarea
                  id="messageText"
                  placeholder="Digite uma mensagem de teste..."
                  value={testMessage.message}
                  onChange={(e) => setTestMessage(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={testTemplate} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Enviando Template...' : 'Testar Template'}
                </Button>

                <Button 
                  onClick={testSimpleMessage} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {isLoading ? 'Testando...' : 'Teste Simples'}
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Preview do Template convitevia:</h4>
                <div className="text-sm space-y-1">
                  <p>🎉 <strong>{testMessage.userName || '[Nome]'}</strong>, você foi convidado para a plataforma Viver de IA!</p>
                  <p>Faça parte da maior comunidade brasileira de aplicação prática de Inteligência Artificial.</p>
                  <p>✨ Aceite seu convite no link: https://viverdeia.ai/convite/[token]</p>
                  <p>Te vejo lá! 🤖</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Debug Logs ({debugLogs.length})
              </CardTitle>
              <CardDescription>
                Logs em tempo real das operações WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum log disponível. Execute alguma operação para ver os logs.
                  </div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={log.level === 'error' ? 'destructive' : log.level === 'success' ? 'default' : 'secondary'}>
                            {log.level}
                          </Badge>
                          <span className="font-medium text-sm">{log.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">{log.message}</div>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">Ver detalhes</summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Health Check
              </CardTitle>
              <CardDescription>
                Status geral e monitoramento da integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">API Status</div>
                  <div className="text-sm text-muted-foreground">
                    {connectionTest?.success ? 'Online' : 'Offline'}
                  </div>
                </div>

                <div className="p-4 border rounded-lg text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Templates</div>
                  <div className="text-sm text-muted-foreground">
                    {templates.length} disponíveis
                  </div>
                </div>

                <div className="p-4 border rounded-lg text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-medium">Rate Limit</div>
                  <div className="text-sm text-muted-foreground">
                    Normal
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Configurações Essenciais:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>WhatsApp Token:</span>
                    <span className={configStatus?.hasToken ? 'text-green-600' : 'text-red-600'}>
                      {configStatus?.hasToken ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone Number ID:</span>
                    <span className={configStatus?.hasPhoneId ? 'text-green-600' : 'text-red-600'}>
                      {configStatus?.hasPhoneId ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business ID:</span>
                    <span className={configStatus?.hasBusinessId ? 'text-green-600' : 'text-red-600'}>
                      {configStatus?.hasBusinessId ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Webhook Token:</span>
                    <span className={configStatus?.hasWebhookToken ? 'text-green-600' : 'text-red-600'}>
                      {configStatus?.hasWebhookToken ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={runFullDiagnostic}
                disabled={isLoading}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isLoading ? 'Executando Diagnóstico...' : 'Executar Diagnóstico Completo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppDebug;
