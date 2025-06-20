
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';

export const ResendDiagnostics: React.FC = () => {
  const { 
    healthStatus, 
    isChecking, 
    performHealthCheck, 
    forceHealthCheck, 
    sendTestEmail, 
    debugInfo 
  } = useResendHealthCheck();
  
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return healthStatus.isHealthy ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isChecking) return <Badge variant="secondary">Verificando...</Badge>;
    return healthStatus.isHealthy ? 
      <Badge variant="default" className="bg-green-500">Operacional</Badge> : 
      <Badge variant="destructive">Com Problemas</Badge>;
  };

  const handleForceCheck = () => {
    forceHealthCheck();
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) return;
    
    setIsTestingEmail(true);
    try {
      await sendTestEmail(testEmail);
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnóstico Resend</h2>
          <p className="text-muted-foreground">
            Monitoramento detalhado do sistema de email Resend
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Status do Resend
            </CardTitle>
            <CardDescription>
              Verificação da conectividade e configuração do Resend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>API Key</span>
              <Badge variant={healthStatus.apiKeyValid ? "default" : "destructive"}>
                {healthStatus.apiKeyValid ? "Válida" : "Inválida"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Conectividade</span>
              <Badge variant={healthStatus.connectivity === 'connected' ? "default" : "destructive"}>
                {healthStatus.connectivity === 'connected' ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Domínio</span>
              <Badge variant={healthStatus.domainValid ? "default" : "destructive"}>
                {healthStatus.domainValid ? "Verificado" : "Pendente"}
              </Badge>
            </div>

            {healthStatus.lastError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Último erro:</strong> {healthStatus.lastError}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleForceCheck}
                disabled={isChecking}
                variant="outline"
                size="sm"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Forçar Verificação'
                )}
              </Button>
            </div>

            {healthStatus.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última verificação: {healthStatus.lastChecked.toLocaleString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste de Email</CardTitle>
            <CardDescription>
              Enviar email de teste para verificar funcionamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email de destino</label>
              <input 
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <Button 
              onClick={handleTestEmail}
              disabled={!testEmail.trim() || isTestingEmail}
              className="w-full"
            >
              {isTestingEmail ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Email de Teste'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações de Debug</CardTitle>
            <CardDescription>
              Dados técnicos para depuração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Timestamp:</span>
                <div className="text-muted-foreground">{debugInfo.timestamp}</div>
              </div>
              
              <div>
                <span className="font-medium">Tentativas:</span>
                <div className="text-muted-foreground">{debugInfo.attempts}</div>
              </div>
              
              <div>
                <span className="font-medium">Método:</span>
                <div className="text-muted-foreground">{debugInfo.method}</div>
              </div>
              
              <div>
                <span className="font-medium">Status HTTP:</span>
                <div className="text-muted-foreground">{debugInfo.responseStatus}</div>
              </div>
              
              <div>
                <span className="font-medium">Tipo de Teste:</span>
                <div className="text-muted-foreground">{debugInfo.testType}</div>
              </div>
              
              <div>
                <span className="font-medium">Fallback Usado:</span>
                <div className="text-muted-foreground">{debugInfo.fallbackUsed ? 'Sim' : 'Não'}</div>
              </div>
              
              {debugInfo.errorDetails && (
                <div className="md:col-span-2">
                  <span className="font-medium">Detalhes do Erro:</span>
                  <div className="text-muted-foreground text-xs mt-1">
                    {debugInfo.errorDetails.message}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
