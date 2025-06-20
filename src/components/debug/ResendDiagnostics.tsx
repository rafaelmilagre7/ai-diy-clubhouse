
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Send,
  Clock,
  Shield,
  Globe
} from 'lucide-react';

export const ResendDiagnostics = () => {
  const { healthStatus, isChecking, performHealthCheck, sendTestEmail } = useResendHealthCheck();
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'verified':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'limited':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'invalid':
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'valid':
      case 'verified':
      case 'operational':
        return 'default';
      case 'limited':
      case 'pending':
        return 'secondary';
      case 'invalid':
      case 'failed':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.includes('@')) return;
    
    setSendingTest(true);
    await sendTestEmail(testEmail);
    setSendingTest(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle className="text-base">Status do Sistema de Email</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={performHealthCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {healthStatus.isHealthy ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {healthStatus.isHealthy ? 'Sistema Operacional' : 'Problemas Detectados'}
            </span>
            <Badge variant={healthStatus.isHealthy ? 'default' : 'destructive'}>
              {healthStatus.isHealthy ? 'Saudável' : 'Requer Atenção'}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Última verificação: {healthStatus.checkedAt.toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes dos Componentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API Key Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Key</CardTitle>
            {getStatusIcon(healthStatus.apiKeyStatus)}
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(healthStatus.apiKeyStatus)}>
              {healthStatus.apiKeyStatus === 'valid' ? 'Válida' :
               healthStatus.apiKeyStatus === 'invalid' ? 'Inválida' :
               healthStatus.apiKeyStatus === 'missing' ? 'Ausente' : 'Erro'}
            </Badge>
          </CardContent>
        </Card>

        {/* Domain Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domínio</CardTitle>
            <Globe className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(healthStatus.domainStatus)}>
              {healthStatus.domainStatus === 'verified' ? 'Verificado' :
               healthStatus.domainStatus === 'pending' ? 'Pendente' :
               healthStatus.domainStatus === 'failed' ? 'Falhou' : 'Desconhecido'}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              viverdeia.ai
            </div>
          </CardContent>
        </Card>

        {/* Email Capability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade</CardTitle>
            <Shield className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusVariant(healthStatus.emailCapability)}>
              {healthStatus.emailCapability === 'operational' ? 'Operacional' :
               healthStatus.emailCapability === 'limited' ? 'Limitado' : 'Erro'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Último Teste */}
      {healthStatus.lastTestEmail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Último Teste de Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {healthStatus.lastTestEmail.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Problemas e Recomendações */}
      {(healthStatus.issues.length > 0 || healthStatus.recommendations.length > 0) && (
        <div className="space-y-4">
          {healthStatus.issues.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Problemas Detectados:</div>
                <ul className="list-disc list-inside space-y-1">
                  {healthStatus.issues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {healthStatus.recommendations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Recomendações:</div>
                <ul className="list-disc list-inside space-y-1">
                  {healthStatus.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Teste Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Testar Envio de Email</CardTitle>
          <CardDescription>
            Envie um email de teste para verificar a funcionalidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleTestEmail}
              disabled={!testEmail.includes('@') || sendingTest}
              size="sm"
            >
              {sendingTest ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Testar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
