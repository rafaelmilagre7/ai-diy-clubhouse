
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { ResendDiagnostics } from './ResendDiagnostics';
import { 
  Database, 
  Shield, 
  Wifi, 
  Storage, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Mail
} from 'lucide-react';

export const SupabaseErrorDiagnostics = () => {
  const { healthStatus, isChecking, performHealthCheck } = useSupabaseHealthCheck();
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
      case 'operational':
        return 'default';
      case 'slow':
        return 'secondary';
      case 'disconnected':
      case 'unauthenticated':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="email">Sistema de Email</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Status Geral do Sistema</CardTitle>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Conexão</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthStatus.connectionStatus)}
                      <Badge variant={getStatusVariant(healthStatus.connectionStatus)}>
                        {healthStatus.connectionStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Autenticação</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthStatus.authStatus)}
                      <Badge variant={getStatusVariant(healthStatus.authStatus)}>
                        {healthStatus.authStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Banco</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthStatus.databaseStatus)}
                      <Badge variant={getStatusVariant(healthStatus.databaseStatus)}>
                        {healthStatus.databaseStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Storage className="h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Storage</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthStatus.storageStatus)}
                      <Badge variant={getStatusVariant(healthStatus.storageStatus)}>
                        {healthStatus.storageStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                Última verificação: {healthStatus.checkedAt.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>

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
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Diagnóstico do Banco de Dados
              </CardTitle>
              <CardDescription>
                Status detalhado das operações de banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status da Conexão</span>
                  <Badge variant={getStatusVariant(healthStatus.databaseStatus)}>
                    {healthStatus.databaseStatus}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Detalhes adicionais sobre performance e queries em desenvolvimento.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Storage className="h-5 w-5" />
                Diagnóstico do Armazenamento
              </CardTitle>
              <CardDescription>
                Status dos buckets e operações de storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status do Storage</span>
                  <Badge variant={getStatusVariant(healthStatus.storageStatus)}>
                    {healthStatus.storageStatus}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Informações detalhadas sobre buckets e uploads em desenvolvimento.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <ResendDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
