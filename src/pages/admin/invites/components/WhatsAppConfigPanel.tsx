
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, MessageCircle, Phone, Settings, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConfigStatus {
  isConfigured: boolean;
  hasToken: boolean;
  hasPhoneId: boolean;
  hasBusinessId: boolean;
  hasWebhookToken: boolean;
  phoneNumber?: string;
  businessName?: string;
  error?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const WhatsAppConfigPanel = () => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    isConfigured: false,
    hasToken: false,
    hasPhoneId: false,
    hasBusinessId: false,
    hasWebhookToken: false
  });
  
  const [testPhone, setTestPhone] = useState('+55');
  const [testMessage, setTestMessage] = useState('Teste de conectividade WhatsApp - Viver de IA');
  const [isChecking, setIsChecking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const checkConfiguration = async () => {
    try {
      setIsChecking(true);
      console.log("🔍 Verificando configuração do WhatsApp...");

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (error) {
        console.error("❌ Erro ao verificar configuração:", error);
        setConfigStatus({
          isConfigured: false,
          hasToken: false,
          hasPhoneId: false,
          hasBusinessId: false,
          hasWebhookToken: false,
          error: error.message
        });
        toast.error("Erro ao verificar configuração");
        return;
      }

      console.log("✅ Status da configuração:", data);
      setConfigStatus(data);
      
      if (data.isConfigured) {
        toast.success("Configuração WhatsApp verificada com sucesso!");
      } else {
        toast.warning("Algumas configurações estão faltando");
      }

    } catch (error: any) {
      console.error("❌ Erro crítico:", error);
      toast.error("Erro ao verificar configuração");
    } finally {
      setIsChecking(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsTesting(true);
      setTestResults([]);
      
      // Teste 1: Verificar perfil do negócio
      console.log("🧪 Testando perfil do negócio...");
      const profileTest = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'get_business_profile' }
      });
      
      setTestResults(prev => [...prev, {
        success: !profileTest.error,
        message: profileTest.error ? 'Falha ao obter perfil do negócio' : 'Perfil do negócio obtido com sucesso',
        data: profileTest.data,
        error: profileTest.error?.message
      }]);

      // Teste 2: Listar templates (se disponível)
      console.log("🧪 Testando templates...");
      const templatesTest = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'list_templates' }
      });
      
      setTestResults(prev => [...prev, {
        success: !templatesTest.error,
        message: templatesTest.error ? 'Falha ao listar templates' : `${templatesTest.data?.data?.length || 0} templates encontrados`,
        data: templatesTest.data,
        error: templatesTest.error?.message
      }]);

      toast.success("Testes de conectividade concluídos!");

    } catch (error: any) {
      console.error("❌ Erro nos testes:", error);
      toast.error("Erro ao executar testes");
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast.error("Preencha o número e a mensagem de teste");
      return;
    }

    try {
      setIsTesting(true);
      console.log("📱 Enviando mensagem de teste...");

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'send_test_message',
          phone: testPhone,
          message: testMessage
        }
      });

      if (error) {
        console.error("❌ Erro ao enviar teste:", error);
        toast.error(`Erro ao enviar mensagem: ${error.message}`);
        return;
      }

      console.log("✅ Mensagem de teste enviada:", data);
      toast.success("Mensagem de teste enviada com sucesso!");
      
      setTestResults(prev => [...prev, {
        success: true,
        message: `Mensagem enviada para ${testPhone}`,
        data: data
      }]);

    } catch (error: any) {
      console.error("❌ Erro crítico no teste:", error);
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsTesting(false);
    }
  };

  React.useEffect(() => {
    checkConfiguration();
  }, []);

  return (
    <div className="space-y-6">
      {/* Status da Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status da Configuração
          </CardTitle>
          <CardDescription>
            Verificação das variáveis de ambiente e conectividade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {configStatus.hasToken ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">API Token</span>
            </div>
            
            <div className="flex items-center gap-2">
              {configStatus.hasPhoneId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Phone ID</span>
            </div>
            
            <div className="flex items-center gap-2">
              {configStatus.hasBusinessId ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Business ID</span>
            </div>
            
            <div className="flex items-center gap-2">
              {configStatus.hasWebhookToken ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Webhook Token</span>
            </div>
          </div>

          {configStatus.phoneNumber && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Número WhatsApp:</strong> {configStatus.phoneNumber}
              </p>
              {configStatus.businessName && (
                <p className="text-sm text-green-800">
                  <strong>Nome do Negócio:</strong> {configStatus.businessName}
                </p>
              )}
            </div>
          )}

          {configStatus.error && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">{configStatus.error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={checkConfiguration} 
              disabled={isChecking}
              variant="outline"
            >
              {isChecking ? "Verificando..." : "Verificar Configuração"}
            </Button>
            
            <Button 
              onClick={testConnection} 
              disabled={isTesting || !configStatus.isConfigured}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? "Testando..." : "Testar Conectividade"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Teste de Mensagem
          </CardTitle>
          <CardDescription>
            Envie uma mensagem de teste para verificar o funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Número de Teste</Label>
              <Input
                id="test-phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
                disabled={!configStatus.isConfigured}
              />
              <p className="text-xs text-muted-foreground">
                Inclua código do país (ex: +55 para Brasil)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-message">Mensagem de Teste</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite sua mensagem de teste..."
                disabled={!configStatus.isConfigured}
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={sendTestMessage} 
            disabled={isTesting || !configStatus.isConfigured || !testPhone || !testMessage}
            className="w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            {isTesting ? "Enviando..." : "Enviar Mensagem de Teste"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{result.message}</p>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1">{result.error}</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Ver detalhes
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Sucesso" : "Erro"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppConfigPanel;
