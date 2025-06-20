
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Bug, Mail, Globe, Database, Shield } from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { toast } from 'sonner';

export const SupabaseErrorDiagnostics: React.FC = () => {
  const { 
    healthStatus: supabaseHealth, 
    isChecking: supabaseChecking, 
    performHealthCheck: checkSupabase 
  } = useSupabaseHealthCheck();
  
  const { 
    healthStatus: resendHealth, 
    isChecking: resendChecking, 
    performHealthCheck: checkResend,
    forceHealthCheck: forceResendCheck,
    sendTestEmail 
  } = useResendHealthCheck();

  const [testEmail, setTestEmail] = React.useState('');
  const [showDebugInfo, setShowDebugInfo] = React.useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }
    
    await sendTestEmail(testEmail);
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: string, isHealthy?: boolean) => {
    if (isHealthy) {
      return <Badge variant="default" className="bg-green-500">Operacional</Badge>;
    }
    
    switch (status) {
      case 'operational':
      case 'connected':
      case 'authenticated':
      case 'valid':
      case 'verified':
        return <Badge variant="default" className="bg-green-500">Operacional</Badge>;
      case 'slow':
      case 'limited':
      case 'pending':
        return <Badge variant="secondary">Limitado</Badge>;
      case 'error':
      case 'disconnected':
      case 'unauthenticated':
      case 'invalid':
      case 'missing':
      case 'failed':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde dos serviços
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            {showDebugInfo ? 'Ocultar Debug' : 'Mostrar Debug'}
          </Button>
          
          <Button
            onClick={() => {
              checkSupabase();
              checkResend();
            }}
            disabled={supabaseChecking || resendChecking}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(supabaseChecking || resendChecking) ? 'animate-spin' : ''}`} />
            Verificar Tudo
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Supabase</span>
              </div>
              {getStatusBadge('', supabaseHealth.isHealthy)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">Sistema de Email</span>
              </div>
              {getStatusBadge('', resendHealth.isHealthy)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico do Supabase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnóstico Supabase
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {supabaseHealth.checkedAt.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseHealth.connectionStatus === 'connected')}
                <span className="text-sm">Conexão</span>
              </div>
              {getStatusBadge(supabaseHealth.connectionStatus)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseHealth.authStatus === 'authenticated')}
                <span className="text-sm">Autenticação</span>
              </div>
              {getStatusBadge(supabaseHealth.authStatus)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseHealth.databaseStatus === 'operational')}
                <span className="text-sm">Banco de Dados</span>
              </div>
              {getStatusBadge(supabaseHealth.databaseStatus)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseHealth.storageStatus === 'operational')}
                <span className="text-sm">Storage</span>
              </div>
              {getStatusBadge(supabaseHealth.storageStatus)}
            </div>
          </div>

          {supabaseHealth.issues.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Problemas Detectados:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {supabaseHealth.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={checkSupabase}
              disabled={supabaseChecking}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${supabaseChecking ? 'animate-spin' : ''}`} />
              {supabaseChecking ? 'Verificando...' : 'Verificar Supabase'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico do Sistema de Email (Resend) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Diagnóstico Sistema de Email (Resend)
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {resendHealth.checkedAt.toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(resendHealth.apiKeyStatus === 'valid')}
                <span className="text-sm">API Key</span>
              </div>
              {getStatusBadge(resendHealth.apiKeyStatus)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(resendHealth.domainStatus === 'verified')}
                <span className="text-sm">Domínio</span>
              </div>
              {getStatusBadge(resendHealth.domainStatus)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(resendHealth.emailCapability === 'operational')}
                <span className="text-sm">Envio Email</span>
              </div>
              {getStatusBadge(resendHealth.emailCapability)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(resendHealth.edgeFunctionStatus === 'working')}
                <span className="text-sm">Edge Function</span>
              </div>
              {getStatusBadge(resendHealth.edgeFunctionStatus)}
            </div>
          </div>

          {/* Debug Info */}
          {showDebugInfo && resendHealth.debugInfo && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
              <h4 className="font-semibold mb-2">Informações de Debug:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(resendHealth.debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Problemas */}
          {resendHealth.issues.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Problemas Detectados:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {resendHealth.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendações */}
          {resendHealth.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Recomendações:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {resendHealth.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Teste de Email */}
          <div className="space-y-3">
            <h4 className="font-semibold">Teste de Envio de Email</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Digite um email para teste"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button
                onClick={handleSendTestEmail}
                disabled={!testEmail || resendChecking}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Enviar Teste
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={forceResendCheck}
              disabled={resendChecking}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Forçar Verificação
            </Button>
            
            <Button
              variant="outline"
              onClick={checkResend}
              disabled={resendChecking}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${resendChecking ? 'animate-spin' : ''}`} />
              {resendChecking ? 'Verificando...' : 'Verificar Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
