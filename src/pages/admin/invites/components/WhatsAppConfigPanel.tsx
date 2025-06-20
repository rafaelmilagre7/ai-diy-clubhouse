
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Settings, 
  TestTube,
  Send,
  ExternalLink,
  Info
} from 'lucide-react';

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

interface ConnectionResult {
  success: boolean;
  message: string;
  details?: any;
}

const WhatsAppConfigPanel = () => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [environment, setEnvironment] = useState<'local' | 'production' | 'unknown'>('unknown');

  // Detectar ambiente
  React.useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setEnvironment('local');
    } else if (hostname.includes('viverdeia') || hostname.includes('supabase')) {
      setEnvironment('production');
    } else {
      setEnvironment('unknown');
    }
  }, []);

  const checkConfiguration = async () => {
    setIsCheckingConfig(true);
    setConfigStatus(null);
    
    try {
      // Primeiro tenta usar a Edge Function
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (error) {
        console.warn('Edge Function não disponível:', error);
        throw new Error('Edge Function indisponível');
      }

      setConfigStatus(data);
      
      if (data.isValid) {
        toast.success('Configuração do WhatsApp válida!');
      } else {
        toast.warning('Configuração incompleta do WhatsApp');
      }

    } catch (error) {
      console.error('Erro ao verificar configuração:', error);
      
      // Fallback: mostrar status básico sem validação das variáveis
      setConfigStatus({
        hasToken: false,
        hasPhoneId: false,
        hasBusinessId: false,
        hasWebhookToken: false,
        isValid: false,
        details: {
          tokenLength: 0,
          phoneIdLength: 0,
          businessIdLength: 0,
          webhookTokenLength: 0
        }
      });
      
      toast.error('Não foi possível verificar a configuração. Edge Functions podem não estar deployadas.');
    } finally {
      setIsCheckingConfig(false);
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    
    try {
      // Primeiro tenta usar a Edge Function
      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'test_connection' }
      });

      if (error) {
        console.warn('Edge Function não disponível, usando teste direto:', error);
        await testConnectionDirect();
        return;
      }

      setConnectionResult(data);
      
      if (data.success) {
        toast.success('Conexão com WhatsApp API bem-sucedida!');
      } else {
        toast.error(`Teste falhou: ${data.message}`);
      }

    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      
      // Fallback para teste direto
      await testConnectionDirect();
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testConnectionDirect = async () => {
    try {
      // Aviso sobre limitações do teste direto
      toast.info('Usando teste direto (limitado por CORS). Para teste completo, use ambiente local.');
      
      setConnectionResult({
        success: false,
        message: 'Teste direto limitado por CORS. Edge Functions recomendadas para teste completo.',
        details: {
          recommendation: 'Use ambiente local ou faça deploy das Edge Functions',
          environment: environment
        }
      });
      
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: `Erro no teste direto: ${error.message}`,
        details: { error: error.message }
      });
    }
  };

  const sendTestMessage = async () => {
    if (!testNumber.trim()) {
      toast.error('Digite um número para teste');
      return;
    }

    setIsSendingTest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-invite-whatsapp', {
        body: {
          inviteId: 'test-' + Date.now(),
          whatsappNumber: testNumber,
          roleId: 'test',
          token: 'TEST123',
          isResend: false,
          notes: 'Mensagem de teste do sistema'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast.success('Mensagem de teste enviada com sucesso!');
      } else {
        toast.error(`Falha no envio: ${data.message}`);
      }

    } catch (error: any) {
      console.error('Erro ao enviar mensagem de teste:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const renderEnvironmentBadge = () => {
    const badgeProps = {
      local: { variant: 'default' as const, text: '🔧 Local' },
      production: { variant: 'secondary' as const, text: '🌐 Produção' },
      unknown: { variant: 'outline' as const, text: '❓ Desconhecido' }
    };

    const { variant, text } = badgeProps[environment];
    
    return <Badge variant={variant}>{text}</Badge>;
  };

  const renderConfigItem = (label: string, hasValue: boolean, length: number) => (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {hasValue ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">({length} chars)</span>
          </>
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status do Ambiente */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Ambiente detectado: {renderEnvironmentBadge()}</span>
          {environment === 'production' && (
            <span className="text-xs text-muted-foreground">
              Edge Functions podem não estar deployadas
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Verificação de Configuração */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status da Configuração
              </CardTitle>
              <CardDescription>
                Verificar se as variáveis de ambiente do WhatsApp estão configuradas
              </CardDescription>
            </div>
            <Button
              onClick={checkConfiguration}
              disabled={isCheckingConfig}
              variant="outline"
            >
              {isCheckingConfig ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Verificar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configStatus && (
            <div className="space-y-3">
              {renderConfigItem('WHATSAPP_API_TOKEN', configStatus.hasToken, configStatus.details.tokenLength)}
              {renderConfigItem('WHATSAPP_PHONE_NUMBER_ID', configStatus.hasPhoneId, configStatus.details.phoneIdLength)}
              {renderConfigItem('WHATSAPP_BUSINESS_ID', configStatus.hasBusinessId, configStatus.details.businessIdLength)}
              {renderConfigItem('WHATSAPP_WEBHOOK_TOKEN', configStatus.hasWebhookToken, configStatus.details.webhookTokenLength)}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Status Geral</span>
                {configStatus.isValid ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Incompleto
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Conexão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Teste de Conexão
              </CardTitle>
              <CardDescription>
                Testar conectividade com a API do WhatsApp Business
              </CardDescription>
            </div>
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Testar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connectionResult && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {connectionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {connectionResult.success ? 'Conexão bem-sucedida!' : 'Teste falhou'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {connectionResult.message}
                  </p>
                  
                  {connectionResult.details && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <pre>{JSON.stringify(connectionResult.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
              
              {environment === 'production' && !connectionResult.success && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dica:</strong> Para funcionalidade completa em produção, 
                    é necessário fazer deploy das Edge Functions do Supabase.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Envio de Mensagem de Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Teste de Envio
          </CardTitle>
          <CardDescription>
            Enviar uma mensagem de teste para verificar o funcionamento completo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-number">Número para teste (com código do país)</Label>
            <Input
              id="test-number"
              type="tel"
              placeholder="+55 11 99999-9999"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use seu próprio número para teste. Formato: +55 11 99999-9999
            </p>
          </div>
          
          <Button
            onClick={sendTestMessage}
            disabled={isSendingTest || !testNumber.trim()}
            className="w-full"
          >
            {isSendingTest ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Mensagem de Teste
          </Button>

          {environment === 'production' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Nota:</strong> Em produção, certifique-se de que as Edge Functions 
                foram deployadas para o funcionamento completo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links Úteis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://developers.facebook.com/apps" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Meta Developers Console
            </a>
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://business.whatsapp.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              WhatsApp Business Manager
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppConfigPanel;
