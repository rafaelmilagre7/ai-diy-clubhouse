
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Phone, Send, TestTube, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigStatus {
  hasToken: boolean;
  hasPhoneId: boolean;
  hasBusinessId: boolean;
  hasWebhookToken: boolean;
  isValid: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const WhatsAppConfigPanel = () => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const checkConfiguration = async () => {
    try {
      setIsLoading(true);
      console.log('🔧 Verificando configuração do WhatsApp...');

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (error) {
        console.error('❌ Erro ao verificar configuração:', error);
        toast.error('Erro ao verificar configuração: ' + error.message);
        return;
      }

      console.log('✅ Resposta da verificação:', data);
      setConfigStatus(data);

      if (data.isValid) {
        toast.success('Configuração WhatsApp válida!');
      } else {
        toast.warning('Configuração incompleta. Verifique as variáveis.');
      }

    } catch (error: any) {
      console.error('❌ Erro na verificação:', error);
      toast.error('Erro ao verificar configuração');
    } finally {
      setIsLoading(false);
    }
  };

  const testWhatsAppConnection = async () => {
    try {
      setIsTesting(true);
      console.log('📱 Testando conexão com WhatsApp API...');

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test_connection' }
      });

      if (error) {
        console.error('❌ Erro no teste:', error);
        setTestResult({
          success: false,
          message: error.message,
          details: error
        });
        toast.error('Teste falhou: ' + error.message);
        return;
      }

      console.log('✅ Resultado do teste:', data);
      setTestResult(data);

      if (data.success) {
        toast.success('Conexão WhatsApp funcionando!');
      } else {
        toast.error('Teste falhou: ' + data.message);
      }

    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        message: 'Erro interno no teste',
        details: error
      });
      toast.error('Erro no teste de conexão');
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone.trim()) {
      toast.error('Por favor, insira um número de telefone');
      return;
    }

    try {
      setIsTesting(true);
      console.log('📤 Enviando mensagem de teste para:', testPhone);

      const { data, error } = await supabase.functions.invoke('send-invite-whatsapp', {
        body: {
          inviteId: 'test-invite',
          whatsappNumber: testPhone,
          roleId: 'test-role',
          token: 'TEST123',
          isResend: false,
          notes: 'Esta é uma mensagem de teste da configuração WhatsApp'
        }
      });

      if (error) {
        console.error('❌ Erro no envio:', error);
        toast.error('Erro ao enviar: ' + error.message);
        return;
      }

      console.log('✅ Resultado do envio:', data);

      if (data.success) {
        toast.success('Mensagem de teste enviada com sucesso!');
      } else {
        toast.error('Falha no envio: ' + data.message);
      }

    } catch (error: any) {
      console.error('❌ Erro no envio:', error);
      toast.error('Erro ao enviar mensagem de teste');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (hasValue: boolean) => {
    return hasValue ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (hasValue: boolean) => {
    return hasValue ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Configurado</Badge>
    ) : (
      <Badge variant="destructive">Não configurado</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status da Configuração
          </CardTitle>
          <CardDescription>
            Verifique se todas as variáveis de ambiente estão configuradas corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkConfiguration} disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Verificar Configuração'}
          </Button>

          {configStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.hasToken)}
                  <span className="font-medium">WHATSAPP_API_TOKEN</span>
                </div>
                {getStatusBadge(configStatus.hasToken)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.hasPhoneId)}
                  <span className="font-medium">WHATSAPP_PHONE_NUMBER_ID</span>
                </div>
                {getStatusBadge(configStatus.hasPhoneId)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.hasBusinessId)}
                  <span className="font-medium">WHATSAPP_BUSINESS_ID</span>
                </div>
                {getStatusBadge(configStatus.hasBusinessId)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.hasWebhookToken)}
                  <span className="font-medium">WHATSAPP_WEBHOOK_TOKEN</span>
                </div>
                {getStatusBadge(configStatus.hasWebhookToken)}
              </div>

              <div className="col-span-full">
                <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(configStatus.isValid)}
                    <span className="font-semibold">Status Geral</span>
                  </div>
                  {configStatus.isValid ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">✅ Todas configuradas</Badge>
                  ) : (
                    <Badge variant="destructive">❌ Configuração incompleta</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connection">Teste de Conexão</TabsTrigger>
          <TabsTrigger value="message">Envio de Mensagem</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Teste de Conexão API
              </CardTitle>
              <CardDescription>
                Verifica se conseguimos nos conectar com a API do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testWhatsAppConnection} disabled={isTesting}>
                {isTesting ? 'Testando...' : 'Testar Conexão'}
              </Button>

              {testResult && (
                <div className={`p-4 border rounded-lg ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? 'Conexão bem-sucedida!' : 'Falha na conexão'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{testResult.message}</p>
                  
                  {testResult.details && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Ver detalhes técnicos</summary>
                      <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="message" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Teste de Envio de Mensagem
              </CardTitle>
              <CardDescription>
                Envie uma mensagem de teste para verificar se tudo está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-phone">Número de Telefone (com código do país)</Label>
                <Input
                  id="test-phone"
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use seu próprio número para testar. Inclua o código do país (+55 para Brasil).
                </p>
              </div>

              <Button 
                onClick={sendTestMessage} 
                disabled={isTesting || !testPhone.trim()}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                {isTesting ? 'Enviando...' : 'Enviar Mensagem de Teste'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppConfigPanel;
