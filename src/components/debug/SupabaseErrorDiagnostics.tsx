
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { EmailSystemManager } from '@/components/admin/email/EmailSystemManager';

export const SupabaseErrorDiagnostics = () => {
  const { healthStatus, isChecking, performHealthCheck } = useSupabaseHealthCheck();
  const resendHealth = useResendHealthCheck();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'slow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'slow':
        return <Clock className="h-4 w-4" />;
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnóstico do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento da saúde dos sistemas Supabase e Resend
          </p>
        </div>
        <Button 
          onClick={performHealthCheck} 
          disabled={isChecking}
          variant="outline"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Verificar Novamente
        </Button>
      </div>

      <Tabs defaultValue="supabase" className="space-y-4">
        <TabsList>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="email">Email (Resend)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="supabase" className="space-y-4">
          {/* Status Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {healthStatus.isHealthy ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Status Geral do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Conexão */}
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-gray-600">Conexão</span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(healthStatus.connectionStatus)} justify-center`}
                  >
                    {getStatusIcon(healthStatus.connectionStatus)}
                    <span className="ml-1 capitalize">{healthStatus.connectionStatus}</span>
                  </Badge>
                </div>

                {/* Banco de Dados */}
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-gray-600">Banco de Dados</span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(healthStatus.databaseStatus)} justify-center`}
                  >
                    {getStatusIcon(healthStatus.databaseStatus)}
                    <span className="ml-1 capitalize">{healthStatus.databaseStatus}</span>
                  </Badge>
                </div>

                {/* Autenticação */}
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-gray-600">Autenticação</span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(healthStatus.authStatus)} justify-center`}
                  >
                    {getStatusIcon(healthStatus.authStatus)}
                    <span className="ml-1 capitalize">{healthStatus.authStatus}</span>
                  </Badge>
                </div>

                {/* Storage */}
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium text-gray-600">Storage</span>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(healthStatus.storageStatus)} justify-center`}
                  >
                    {getStatusIcon(healthStatus.storageStatus)}
                    <span className="ml-1 capitalize">{healthStatus.storageStatus}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {healthStatus.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Problemas Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {healthStatus.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Última Verificação:</span>
                  <p className="mt-1">{healthStatus.checkedAt.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status Geral:</span>
                  <p className="mt-1">
                    {healthStatus.isHealthy ? (
                      <span className="text-green-600 font-medium">Sistema Operacional</span>
                    ) : (
                      <span className="text-red-600 font-medium">Problemas Detectados</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <EmailSystemManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
