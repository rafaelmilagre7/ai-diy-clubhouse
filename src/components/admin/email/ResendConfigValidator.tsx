
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { resendTestService } from '@/services/resendTestService';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Key,
  Globe,
  Mail,
  Zap
} from 'lucide-react';

export const ResendConfigValidator: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);
  const [testProgress, setTestProgress] = useState(0);
  const { toast } = useToast();

  const runHealthCheck = async () => {
    setIsTestingHealth(true);
    setTestProgress(0);
    setHealthResult(null);

    try {
      console.log('🔍 Iniciando teste de saúde do Resend...');
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setTestProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await resendTestService.testHealthWithDirectFetch(1, true);
      
      clearInterval(progressInterval);
      setTestProgress(100);
      
      setHealthResult(result);
      
      console.log('📊 Resultado do teste:', result);
      
      if (result.healthy) {
        toast({
          title: "✅ Sistema Resend Operacional!",
          description: `Conectividade: ${result.connectivity}, Tempo: ${result.responseTime}ms`,
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Problemas Detectados",
          description: result.issues.join(', '),
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de saúde:', error);
      toast({
        title: "Erro no Diagnóstico",
        description: error.message,
        variant: "destructive"
      });
      
      setHealthResult({
        healthy: false,
        connectivity: 'error',
        issues: [`Erro crítico: ${error.message}`]
      });
    } finally {
      setIsTestingHealth(false);
      setTestProgress(0);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido para teste",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);
    
    try {
      console.log(`📧 Enviando email de teste para: ${testEmail}`);
      
      const result = await resendTestService.sendTestEmailDirect(testEmail);
      
      if (result.success) {
        toast({
          title: "✅ Email de Teste Enviado!",
          description: `Verifique a caixa de entrada de ${testEmail}`,
          duration: 8000,
        });
        console.log('✅ Email enviado com ID:', result.emailId);
      } else {
        toast({
          title: "❌ Falha no Envio",
          description: result.error || 'Erro desconhecido',
          variant: "destructive",
          duration: 8000,
        });
        console.error('❌ Falha no envio:', result.error);
      }
    } catch (error: any) {
      console.error('❌ Erro no envio de teste:', error);
      toast({
        title: "Erro no Teste de Email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'down':
      case 'disconnected':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
      case 'disconnected':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Validação da Configuração Resend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={runHealthCheck}
              disabled={isTestingHealth}
              className="flex items-center gap-2"
            >
              {isTestingHealth ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isTestingHealth ? 'Testando...' : 'Executar Diagnóstico Completo'}
            </Button>
            
            {healthResult && (
              <Badge 
                className={`${getStatusColor(healthResult.connectivity)} text-white`}
              >
                {healthResult.healthy ? 'Sistema Operacional' : 'Problemas Detectados'}
              </Badge>
            )}
          </div>

          {isTestingHealth && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Executando diagnóstico...</span>
                <span>{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados do Diagnóstico */}
      {healthResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Resultados do Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Key className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">API Key</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthResult.apiKeyValid ? 'connected' : 'error')}
                    <span className="text-xs">
                      {healthResult.apiKeyValid ? 'Configurada' : 'Não encontrada'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Globe className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">Conectividade</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthResult.connectivity)}
                    <span className="text-xs">{healthResult.connectivity}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Mail className="h-4 w-4" />
                <div>
                  <p className="font-medium text-sm">Domínio</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthResult.domainValid ? 'connected' : 'error')}
                    <span className="text-xs">
                      {healthResult.domainValid ? 'Validado' : 'Não validado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {healthResult.responseTime && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tempo de Resposta:</strong> {healthResult.responseTime}ms
                </p>
              </div>
            )}

            {healthResult.issues && healthResult.issues.length > 0 && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">Problemas Detectados:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {healthResult.issues.map((issue: string, index: number) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Teste de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Teste de Envio de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Email para Teste</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={isSendingTest}
            />
          </div>
          
          <Button 
            onClick={sendTestEmail}
            disabled={isSendingTest || !testEmail}
            className="flex items-center gap-2"
          >
            {isSendingTest ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isSendingTest ? 'Enviando...' : 'Enviar Email de Teste'}
          </Button>

          <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
            <p><strong>Este teste irá:</strong></p>
            <ul className="mt-1 space-y-1">
              <li>• Verificar se a API Key está funcionando</li>
              <li>• Testar se o domínio viverdeia.ai está validado</li>
              <li>• Enviar um email real de diagnóstico</li>
              <li>• Confirmar se o sistema está 100% operacional</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Configuração */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">🔧 Configuração do Resend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-900">Passos para configuração:</h4>
            <ol className="space-y-1 text-yellow-800">
              <li>1. <strong>API Key:</strong> Configurada via Supabase Secrets (RESEND_API_KEY)</li>
              <li>2. <strong>Domínio:</strong> Validar viverdeia.ai no painel do Resend</li>
              <li>3. <strong>DNS:</strong> Configurar registros DKIM e SPF</li>
              <li>4. <strong>Teste:</strong> Executar diagnóstico e enviar email de teste</li>
            </ol>
          </div>
          
          <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
            <p className="text-yellow-900">
              <strong>Importante:</strong> Se o diagnóstico falhar, verifique se o domínio 
              viverdeia.ai está completamente validado no painel do Resend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
