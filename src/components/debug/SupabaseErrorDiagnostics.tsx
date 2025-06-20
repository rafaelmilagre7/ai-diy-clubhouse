
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertCircle, 
  CheckCircle, 
  Database, 
  Shield, 
  Mail, 
  RefreshCw, 
  ChevronDown,
  Server,
  Key,
  Globe,
  Clock
} from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { ResendDiagnostics } from './ResendDiagnostics';

export const SupabaseErrorDiagnostics: React.FC = () => {
  const { healthStatus: supabaseHealth, isChecking: supabaseChecking, performHealthCheck: checkSupabase } = useSupabaseHealthCheck();
  const { healthStatus: resendHealth, isChecking: resendChecking, performHealthCheck: checkResend, debugInfo } = useResendHealthCheck();
  const [showSupabaseDebug, setShowSupabaseDebug] = useState(false);
  const [showResendDebug, setShowResendDebug] = useState(false);

  const getStatusIcon = (isHealthy: boolean, isChecking: boolean) => {
    if (isChecking) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    return isHealthy ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isHealthy: boolean, healthyLabel = 'Operacional', unhealthyLabel = 'Com Problemas') => {
    return (
      <Badge variant={isHealthy ? "default" : "destructive"} className={isHealthy ? "bg-green-500" : ""}>
        {isHealthy ? healthyLabel : unhealthyLabel}
      </Badge>
    );
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'text-green-500';
      case 'slow':
        return 'text-yellow-500';
      case 'disconnected':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde dos sistemas Supabase e Resend
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => checkSupabase()}
            disabled={supabaseChecking}
            variant="outline"
            size="sm"
          >
            {supabaseChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Verificar Supabase
          </Button>
          <Button 
            onClick={() => checkResend(true)}
            disabled={resendChecking}
            variant="outline"
            size="sm"
          >
            {resendChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Verificar Resend
          </Button>
        </div>
      </div>

      {/* Visão Geral dos Sistemas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(supabaseHealth.isHealthy, supabaseChecking)}
                {getStatusBadge(supabaseHealth.isHealthy)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>Conexão:</span>
                <Badge variant="outline" className={getConnectionStatusColor(supabaseHealth.connectionStatus)}>
                  {supabaseHealth.connectionStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Auth:</span>
                <Badge variant="outline" className={getConnectionStatusColor(supabaseHealth.authStatus)}>
                  {supabaseHealth.authStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <Badge variant="outline" className={getConnectionStatusColor(supabaseHealth.databaseStatus)}>
                  {supabaseHealth.databaseStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Storage:</span>
                <Badge variant="outline" className={getConnectionStatusColor(supabaseHealth.storageStatus)}>
                  {supabaseHealth.storageStatus}
                </Badge>
              </div>
            </div>

            {supabaseHealth.issues.length > 0 && (
              <div className="mt-3">
                <Collapsible open={showSupabaseDebug} onOpenChange={setShowSupabaseDebug}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSupabaseDebug ? 'rotate-180' : ''}`} />
                    {supabaseHealth.issues.length} problema{supabaseHealth.issues.length > 1 ? 's' : ''} detectado{supabaseHealth.issues.length > 1 ? 's' : ''}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {supabaseHealth.issues.map((issue, index) => (
                      <div key={index} className="text-xs p-2 rounded bg-red-50 text-red-800 border border-red-200">
                        {issue}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Última verificação: {supabaseHealth.checkedAt.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Resend
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(resendHealth.isHealthy, resendChecking)}
                {getStatusBadge(resendHealth.isHealthy)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>API Key:</span>
                <Badge variant="outline" className={resendHealth.apiKeyValid ? 'text-green-500' : 'text-red-500'}>
                  {resendHealth.apiKeyValid ? 'Válida' : 'Inválida'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Conectividade:</span>
                <Badge variant="outline" className={getConnectionStatusColor(resendHealth.connectivity)}>
                  {resendHealth.connectivity}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Domínio:</span>
                <Badge variant="outline" className={resendHealth.domainValid ? 'text-green-500' : 'text-yellow-500'}>
                  {resendHealth.domainValid ? 'Verificado' : 'Pendente'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Latência:</span>
                <Badge variant="outline">
                  {resendHealth.responseTime ? `${resendHealth.responseTime}ms` : '--'}
                </Badge>
              </div>
            </div>

            {resendHealth.issues?.length > 0 && (
              <div className="mt-3">
                <Collapsible open={showResendDebug} onOpenChange={setShowResendDebug}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showResendDebug ? 'rotate-180' : ''}`} />
                    {resendHealth.issues.length} problema{resendHealth.issues.length > 1 ? 's' : ''} detectado{resendHealth.issues.length > 1 ? 's' : ''}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {resendHealth.issues.map((issue, index) => (
                      <div key={index} className="text-xs p-2 rounded bg-red-50 text-red-800 border border-red-200">
                        {issue}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {resendHealth.lastError && (
              <div className="text-xs p-2 rounded bg-red-50 text-red-800 border border-red-200">
                <strong>Último erro:</strong> {resendHealth.lastError}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Última verificação: {resendHealth.lastChecked?.toLocaleString('pt-BR') || 'Nunca'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Diagnósticos Detalhados */}
      <Tabs defaultValue="resend" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resend" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sistema de Email
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Base de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resend" className="space-y-4">
          <ResendDiagnostics />
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Diagnóstico Supabase
              </CardTitle>
              <CardDescription>
                Verificação detalhada dos serviços Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Status dos Serviços</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        Conexão
                      </span>
                      {getStatusBadge(supabaseHealth.connectionStatus === 'connected', 'Conectado', 'Desconectado')}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Autenticação
                      </span>
                      {getStatusBadge(supabaseHealth.authStatus === 'authenticated', 'OK', 'Erro')}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database
                      </span>
                      {getStatusBadge(supabaseHealth.databaseStatus === 'operational', 'Operacional', 'Erro')}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Storage
                      </span>
                      {getStatusBadge(supabaseHealth.storageStatus === 'operational', 'Operacional', 'Erro')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Informações do Sistema</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Última Verificação:</span>
                      <span className="text-muted-foreground">
                        {supabaseHealth.checkedAt.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status Geral:</span>
                      <span className={supabaseHealth.isHealthy ? 'text-green-600' : 'text-red-600'}>
                        {supabaseHealth.isHealthy ? 'Saudável' : 'Com Problemas'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Problemas Detectados:</span>
                      <span>{supabaseHealth.issues.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {debugInfo && (
                <div className="mt-6">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                      <ChevronDown className="h-4 w-4" />
                      Informações de Debug
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="p-3 rounded bg-gray-50 border text-xs font-mono">
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
