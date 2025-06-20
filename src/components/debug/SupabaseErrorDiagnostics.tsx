
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { Database, Shield, Activity, Mail, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { ResendDiagnostics } from './ResendDiagnostics';

export const SupabaseErrorDiagnostics = () => {
  const { 
    healthStatus: supabaseHealth, 
    isChecking: isCheckingSupabase, 
    performHealthCheck: checkSupabaseHealth 
  } = useSupabaseHealthCheck();
  
  const { 
    healthStatus: resendHealth, 
    isChecking: isCheckingResend, 
    performHealthCheck: checkResendHealth 
  } = useResendHealthCheck();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
      case 'limited':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
      case 'limited':
        return <Clock className="h-4 w-4" />;
      case 'error':
      case 'down':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Diagnóstico do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde dos serviços
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={checkSupabaseHealth} 
            disabled={isCheckingSupabase}
            variant="outline"
            size="sm"
          >
            {isCheckingSupabase ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Verificar Supabase
          </Button>
          <Button 
            onClick={checkResendHealth} 
            disabled={isCheckingResend}
            variant="outline"
            size="sm"
          >
            {isCheckingResend ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Verificar Email
          </Button>
        </div>
      </div>

      <Tabs defaultValue="supabase" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="supabase" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Sistema de Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="supabase" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Geral */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                {getStatusIcon(supabaseHealth.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getStatusColor(supabaseHealth.status)}>
                    {supabaseHealth.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Última verificação: {new Date(supabaseHealth.checkedAt).toLocaleTimeString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            {/* Conexão com Banco */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getStatusColor(supabaseHealth.database.status)}>
                    {supabaseHealth.database.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Latência: {supabaseHealth.database.responseTime}ms
                </p>
              </CardContent>
            </Card>

            {/* Autenticação */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Autenticação</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge className={getStatusColor(supabaseHealth.auth.status)}>
                    {supabaseHealth.auth.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuários ativos: {supabaseHealth.auth.activeUsers}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Problemas Detectados */}
          {supabaseHealth.issues.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Problemas detectados:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {supabaseHealth.issues.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Recomendações */}
          {supabaseHealth.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {supabaseHealth.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <ResendDiagnostics />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditoria de Segurança</CardTitle>
              <CardDescription>
                Verificação automática de configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sistema de auditoria de segurança será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
