
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  MessageCircle, 
  Phone,
  FileText,
  Building,
  TestTube
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigStatus {
  configured: boolean;
  hasApiToken: boolean;
  hasPhoneNumberId: boolean;
  hasBusinessId: boolean;
  phoneNumberId?: string;
  businessId?: string;
  webhookConfigured: boolean;
  testConnectionStatus: 'success' | 'failed' | 'not_tested';
  lastTestAt?: string;
  errors: string[];
  templates?: any[];
  businessAccounts?: any[];
}

const WhatsAppConfigPanel = () => {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      console.log('🔍 Verificando status do WhatsApp...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ Erro ao verificar status:', error);
        toast.error('Erro ao verificar configuração do WhatsApp');
        return;
      }

      console.log('✅ Status recebido:', data);
      setStatus(data.status);

      if (data.status?.errors?.length > 0) {
        toast.warning(`Configuração incompleta: ${data.status.errors.length} problemas encontrados`);
      } else if (data.status?.configured) {
        toast.success('WhatsApp configurado corretamente!');
      }

    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      toast.error('Erro ao verificar configuração');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string, payload?: any) => {
    try {
      setActionLoading(action);
      console.log(`🎯 Executando ação: ${action}`, payload);

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        method: 'POST',
        body: { action, ...payload }
      });

      if (error) {
        console.error(`❌ Erro na ação ${action}:`, error);
        toast.error(`Erro ao executar ${action}`);
        return;
      }

      console.log(`✅ Ação ${action} concluída:`, data);
      
      if (data.success) {
        toast.success(data.message || `${action} executado com sucesso`);
        
        // Atualizar status local
        if (data.status) {
          setStatus(data.status);
        }

        // Ações específicas por tipo
        switch (action) {
          case 'list_templates':
            if (data.data?.templates) {
              console.log('📋 Templates encontrados:', data.data.templates);
            }
            break;
          case 'list_business_accounts':
            if (data.data?.businessAccounts) {
              console.log('🏢 Business accounts:', data.data.businessAccounts);
            }
            break;
          case 'test_message':
            if (data.data?.messageId) {
              toast.success(`Mensagem enviada! ID: ${data.data.messageId}`);
              setTestPhoneNumber('');
              setTestMessage('');
            }
            break;
        }
      } else {
        toast.error(data.message || `Falha ao executar ${action}`);
      }

    } catch (error) {
      console.error(`❌ Erro na ação ${action}:`, error);
      toast.error(`Erro inesperado ao executar ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (hasItem: boolean) => {
    return hasItem ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getConnectionStatusBadge = () => {
    switch (status?.testConnectionStatus) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falha na Conexão</Badge>;
      default:
        return <Badge variant="secondary">Não Testado</Badge>;
    }
  };

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuração do WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando configuração...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Configuração do WhatsApp Business API
        </CardTitle>
        <CardDescription>
          Configure e teste a integração com WhatsApp Business API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="test">Testes</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Status da Configuração</h3>
              <div className="flex items-center gap-2">
                {getConnectionStatusBadge()}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status?.hasApiToken || false)}
                  <span>Token da API</span>
                </div>
                <Badge variant={status?.hasApiToken ? "default" : "destructive"}>
                  {status?.hasApiToken ? "Configurado" : "Não Configurado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status?.hasPhoneNumberId || false)}
                  <span>Phone Number ID</span>
                </div>
                <div className="flex items-center gap-2">
                  {status?.phoneNumberId && (
                    <span className="text-sm text-muted-foreground font-mono">
                      {status.phoneNumberId}
                    </span>
                  )}
                  <Badge variant={status?.hasPhoneNumberId ? "default" : "destructive"}>
                    {status?.hasPhoneNumberId ? "Configurado" : "Não Configurado"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status?.hasBusinessId || false)}
                  <span>Business Account ID</span>
                </div>
                <div className="flex items-center gap-2">
                  {status?.businessId && (
                    <span className="text-sm text-muted-foreground font-mono">
                      {status.businessId}
                    </span>
                  )}
                  <Badge variant={status?.hasBusinessId ? "default" : "destructive"}>
                    {status?.hasBusinessId ? "Configurado" : "Não Configurado"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status?.webhookConfigured || false)}
                  <span>Webhook Token</span>
                </div>
                <Badge variant={status?.webhookConfigured ? "default" : "destructive"}>
                  {status?.webhookConfigured ? "Configurado" : "Não Configurado"}
                </Badge>
              </div>
            </div>

            {status?.errors && status.errors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Problemas encontrados:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {status.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {status?.lastTestAt && (
              <div className="text-sm text-muted-foreground">
                Último teste: {new Date(status.lastTestAt).toLocaleString('pt-BR')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Templates de Mensagem</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => performAction('list_templates')}
                disabled={actionLoading === 'list_templates'}
              >
                {actionLoading === 'list_templates' ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Listar Templates
              </Button>
            </div>

            {status?.templates && status.templates.length > 0 ? (
              <div className="space-y-2">
                {status.templates.map((template: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.language}</p>
                      </div>
                      <Badge variant={template.status === 'APPROVED' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum template encontrado</p>
                <p className="text-sm">Clique em "Listar Templates" para carregar</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Testes de Conectividade</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => performAction('test_connection')}
                  disabled={actionLoading === 'test_connection'}
                >
                  {actionLoading === 'test_connection' ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar Conexão
                </Button>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Enviar Mensagem de Teste</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="test-phone">Número de Telefone (com código do país)</Label>
                  <Input
                    id="test-phone"
                    type="tel"
                    placeholder="+5511999999999"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-message">Mensagem (opcional)</Label>
                  <Input
                    id="test-message"
                    placeholder="Mensagem personalizada..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={() => performAction('test_message', { 
                    phoneNumber: testPhoneNumber,
                    message: testMessage 
                  })}
                  disabled={!testPhoneNumber || actionLoading === 'test_message'}
                  className="w-full"
                >
                  {actionLoading === 'test_message' ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Phone className="h-4 w-4 mr-2" />
                  )}
                  Enviar Mensagem de Teste
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Business Accounts</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => performAction('list_business_accounts')}
                disabled={actionLoading === 'list_business_accounts'}
              >
                {actionLoading === 'list_business_accounts' ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Building className="h-4 w-4 mr-2" />
                )}
                Listar Business Accounts
              </Button>
            </div>

            {status?.businessAccounts && status.businessAccounts.length > 0 ? (
              <div className="space-y-2">
                {status.businessAccounts.map((account: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{account.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{account.id}</p>
                      </div>
                      <Badge variant={account.id === status.businessId ? 'default' : 'secondary'}>
                        {account.id === status.businessId ? 'Atual' : 'Disponível'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum business account encontrado</p>
                <p className="text-sm">Clique em "Listar Business Accounts" para carregar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WhatsAppConfigPanel;
