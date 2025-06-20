
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, RefreshCw, Mail, Activity, Zap, TestTube, Send } from 'lucide-react';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { resendTestService } from '@/services/resendTestService';
import { toast } from 'sonner';

export const ResendDiagnostics: React.FC = () => {
  const { healthStatus, isChecking, performHealthCheck, forceHealthCheck, sendTestEmail, debugInfo } = useResendHealthCheck();
  const [testEmail, setTestEmail] = useState('');
  const [isTestingDirect, setIsTestingDirect] = useState(false);

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    return healthStatus.isHealthy ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isChecking) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      <Activity className="h-3 w-3 mr-1" />
      Verificando...
    </Badge>;
    return healthStatus.isHealthy ? 
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Operacional
      </Badge> : 
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Com Problemas
      </Badge>;
  };

  const handleTestDirectApi = async () => {
    setIsTestingDirect(true);
    try {
      const result = await resendTestService.testResendApiDirect();
      if (result.connected) {
        toast.success('Conectividade direta com Resend confirmada');
      } else {
        toast.error(`Falha na conectividade direta: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Erro no teste direto: ${error.message}`);
    } finally {
      setIsTestingDirect(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }
    await sendTestEmail(testEmail);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Diagnóstico do Sistema de Email
          </h2>
          <p className="text-muted-foreground">
            Monitoramento avançado e diagnóstico do Resend
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Verificação otimizada com fallback automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium">API Key</span>
                <Badge variant={healthStatus.apiKeyValid ? "default" : "destructive"} className="text-xs">
                  {healthStatus.apiKeyValid ? "Válida" : "Inválida"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium">Conectividade</span>
                <Badge variant={healthStatus.connectivity === 'connected' ? "default" : "destructive"} className="text-xs">
                  {healthStatus.connectivity === 'connected' ? "Conectado" : "Erro"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium">Domínio</span>
                <Badge variant={healthStatus.domainValid ? "default" : "secondary"} className="text-xs">
                  {healthStatus.domainValid ? "Verificado" : "Pendente"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm font-medium">Tempo Resposta</span>
                <span className="text-xs font-mono text-gray-600">
                  {healthStatus.responseTime ? `${healthStatus.responseTime}ms` : '--'}
                </span>
              </div>
            </div>

            {healthStatus.issues.length > 0 && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-2">Problemas Detectados:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {healthStatus.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={() => performHealthCheck(false)}
                disabled={isChecking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Verificar Agora
                  </>
                )}
              </Button>

              <Button 
                onClick={forceHealthCheck}
                disabled={isChecking}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Forçar Check
              </Button>
            </div>

            {healthStatus.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última verificação: {healthStatus.lastChecked.toLocaleString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Testes Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-500" />
              Testes Avançados
            </CardTitle>
            <CardDescription>
              Diagnósticos diretos e testes de email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleTestDirectApi}
                disabled={isTestingDirect}
                variant="outline"
                className="w-full"
              >
                {isTestingDirect ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando API...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Teste Direto Resend API
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleSendTestEmail}
                  disabled={isChecking || !testEmail}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Email de Teste
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Information */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações de Debug - Resend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Timestamp:</span>
                <p className="text-muted-foreground font-mono">{debugInfo.timestamp}</p>
              </div>
              <div>
                <span className="font-medium">Tentativas:</span>
                <p className="text-muted-foreground">{debugInfo.attempts}</p>
              </div>
              <div>
                <span className="font-medium">Método:</span>
                <p className="text-muted-foreground">{debugInfo.method}</p>
              </div>
              <div>
                <span className="font-medium">Status Response:</span>
                <p className="text-muted-foreground">{debugInfo.responseStatus || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Tipo de Teste:</span>
                <p className="text-muted-foreground">{debugInfo.testType || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Fallback Usado:</span>
                <p className="text-muted-foreground">{debugInfo.fallbackUsed ? 'Sim' : 'Não'}</p>
              </div>
              {debugInfo.errorDetails && (
                <div className="col-span-full">
                  <span className="font-medium">Detalhes do Erro:</span>
                  <p className="text-muted-foreground font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {debugInfo.errorDetails}
                  </p>
                </div>
              )}
            </div>
            {healthStatus.lastChecked && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="font-medium">Última verificação:</span>
                <p className="text-muted-foreground">{healthStatus.lastChecked.toLocaleString('pt-BR')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
