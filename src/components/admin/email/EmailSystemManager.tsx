
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Mail } from 'lucide-react';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';

export const EmailSystemManager: React.FC = () => {
  const { status, isChecking, checkHealth } = useResendHealthCheck();

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return status.isHealthy ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (isChecking) return <Badge variant="secondary">Verificando...</Badge>;
    return status.isHealthy ? 
      <Badge variant="default" className="bg-green-500">Operacional</Badge> : 
      <Badge variant="destructive">Com Problemas</Badge>;
  };

  const handleForceCheck = () => {
    checkHealth();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sistema de Email</h2>
          <p className="text-muted-foreground">
            Monitoramento e diagnóstico do sistema de envio de emails
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
              <Badge variant={status.apiKeyValid ? "default" : "destructive"}>
                {status.apiKeyValid ? "Válida" : "Inválida"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Conectividade</span>
              <Badge variant={status.connectivity === 'connected' ? "default" : "destructive"}>
                {status.connectivity === 'connected' ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Domínio</span>
              <Badge variant={status.domainValid ? "default" : "destructive"}>
                {status.domainValid ? "Verificado" : "Pendente"}
              </Badge>
            </div>

            {status.lastError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Último erro:</strong> {status.lastError}
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

            {status.lastChecked && (
              <p className="text-xs text-muted-foreground">
                Última verificação: {status.lastChecked.toLocaleString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Email</CardTitle>
            <CardDescription>
              Métricas de envio e entrega de emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-md bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">--</div>
                <div className="text-sm text-blue-800">Enviados Hoje</div>
              </div>
              <div className="text-center p-3 rounded-md bg-green-50">
                <div className="text-2xl font-bold text-green-600">--</div>
                <div className="text-sm text-green-800">Taxa de Entrega</div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Estatísticas detalhadas em breve
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
