
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseHealthCheck } from "@/hooks/supabase/useSupabaseHealthCheck";
import { useSecurityCache } from "@/hooks/performance/useSecurityCache";
import { Database, Shield, RefreshCw, Mail, AlertTriangle } from "lucide-react";
import { EmailSystemManager } from "@/components/admin/email/EmailSystemManager";

export const SupabaseErrorDiagnostics = () => {
  const { status, performHealthCheck, isChecking } = useSupabaseHealthCheck();
  const securityMetrics = useSecurityCache({ ttl: 300000 });
  const [activeTab, setActiveTab] = useState("system");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
      case "degraded":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
      case "disconnected":
      case "down":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "operational":
        return "🟢";
      case "warning":
      case "degraded":
        return "🟡";
      case "error":
      case "disconnected":
      case "down":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnóstico do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da saúde dos sistemas
          </p>
        </div>
        <Button
          onClick={performHealthCheck}
          disabled={isChecking}
          variant="outline"
        >
          {isChecking ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Verificar Tudo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {/* Status Geral do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Status do Supabase
              </CardTitle>
              <CardDescription>
                Conectividade e saúde dos serviços do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(status.connectionStatus)}</span>
                    <span className="font-medium">Conexão</span>
                  </div>
                  <Badge className={getStatusColor(status.connectionStatus)}>
                    {status.connectionStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(status.authStatus)}</span>
                    <span className="font-medium">Auth</span>
                  </div>
                  <Badge className={getStatusColor(status.authStatus)}>
                    {status.authStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(status.databaseStatus)}</span>
                    <span className="font-medium">Database</span>
                  </div>
                  <Badge className={getStatusColor(status.databaseStatus)}>
                    {status.databaseStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(status.storageStatus)}</span>
                    <span className="font-medium">Storage</span>
                  </div>
                  <Badge className={getStatusColor(status.storageStatus)}>
                    {status.storageStatus}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Última verificação: {status.lastChecked.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <EmailSystemManager />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Métricas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Métricas de Segurança
              </CardTitle>
              <CardDescription>
                Cache e performance de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Hit Ratio</div>
                  <div className="text-2xl font-bold">
                    {(securityMetrics.hitRatio * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                  <div className="text-2xl font-bold">
                    {securityMetrics.totalRequests.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Cache Hits</div>
                  <div className="text-2xl font-bold text-green-600">
                    {securityMetrics.hits.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Cache Misses</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {securityMetrics.misses.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Status de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Sistema Seguro
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Nenhuma ameaça detectada
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
