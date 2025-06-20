
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Mail, 
  Shield, 
  Globe,
  Clock,
  Zap,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { resendTestService } from '@/services/resendTestService';

export const ResendConfigValidator: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const validateConfiguration = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Iniciando validação completa da configuração...');
      
      const health = await resendTestService.testHealthWithDirectFetch(1, true);
      setHealthStatus(health);
      
      if (health.healthy) {
        toast.success('Configuração do Resend validada com sucesso!', {
          description: `Tempo de resposta: ${health.responseTime}ms`
        });
      } else {
        toast.error('Problemas detectados na configuração', {
          description: health.issues.join(', ')
        });
      }
    } catch (error: any) {
      console.error('Erro na validação:', error);
      toast.error('Erro na validação da configuração');
    } finally {
      setIsValidating(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsSendingTest(true);
    try {
      console.log('📧 Enviando email de teste para:', testEmail);
      
      const result = await resendTestService.sendTestEmailDirect(testEmail);
      setTestResult(result);
      
      if (result.success) {
        toast.success('Email de teste enviado com sucesso!', {
          description: `ID: ${result.emailId}`
        });
      } else {
        toast.error('Falha no envio do email de teste', {
          description: result.error
        });
      }
    } catch (error: any) {
      console.error('Erro no teste de email:', error);
      toast.error('Erro no envio do email de teste');
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="text-xs">
        {status ? "✅" : "❌"} {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Validador de Configuração Resend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={validateConfiguration}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              {isValidating ? 'Validando...' : 'Validar Configuração'}
            </Button>
          </div>

          {healthStatus && (
            <div className="space-y-3 mt-4">
              <Separator />
              <h4 className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Status da Configuração
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {getStatusBadge(healthStatus.healthy, "Sistema Saudável")}
                {getStatusBadge(healthStatus.apiKeyValid, "API Key Válida")}
                {getStatusBadge(healthStatus.connectivity === 'connected', "Conectividade")}
                {getStatusBadge(healthStatus.domainValid, "Domínio Válido")}
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span><strong>Tempo de Resposta:</strong> {healthStatus.responseTime || 0}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span><strong>Conectividade:</strong> {healthStatus.connectivity}</span>
                </div>
                {healthStatus.issues && healthStatus.issues.length > 0 && (
                  <div className="text-red-600">
                    <strong>Problemas:</strong> {healthStatus.issues.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-500" />
            Teste de Envio de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email de Teste</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={sendTestEmail}
            disabled={isSendingTest || !testEmail}
            className="flex items-center gap-2 w-full"
          >
            {isSendingTest ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isSendingTest ? 'Enviando...' : 'Enviar Email de Teste'}
          </Button>

          {testResult && (
            <div className="space-y-2 mt-4">
              <Separator />
              <div className="flex items-center gap-2">
                {getStatusIcon(testResult.success)}
                <span className="font-medium">
                  {testResult.success ? 'Email Enviado' : 'Falha no Envio'}
                </span>
              </div>
              
              {testResult.success && testResult.emailId && (
                <div className="bg-green-50 p-2 rounded text-sm">
                  <strong>ID do Email:</strong> {testResult.emailId}
                </div>
              )}
              
              {!testResult.success && testResult.error && (
                <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                  <strong>Erro:</strong> {testResult.error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-blue-900">💡 Dicas de Configuração:</h4>
            <ul className="space-y-1 text-blue-800">
              <li>• Verifique se o domínio está validado no painel do Resend</li>
              <li>• Confirme se a API key tem permissões de envio</li>
              <li>• Teste diferentes emails para validar entregabilidade</li>
              <li>• Monitore os logs para detectar problemas rapidamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
