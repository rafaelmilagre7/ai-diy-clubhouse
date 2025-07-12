/**
 * COMPONENTE DE ALERTAS DE SEGURANÇA EM TEMPO REAL
 * ================================================
 * 
 * Exibe alertas de segurança críticos na interface admin
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Activity, X } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/security/useSecurityMonitoring';

export function SecurityAlertsWidget() {
  const { alerts, metrics, isMonitoring, dismissAlert, runSecurityScan } = useSecurityMonitoring();

  if (!isMonitoring) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoramento de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Acesso restrito a administradores
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" | "info" | "warning" | "success" => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-4">
      {/* Métricas Resumidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status de Segurança
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runSecurityScan}
              className="text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Varredura
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {metrics.recentViolations}
              </div>
              <div className="text-xs text-muted-foreground">
                Violações (24h)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {metrics.failedLogins}
              </div>
              <div className="text-xs text-muted-foreground">
                Login Falhas (24h)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {metrics.suspiciousIPs.length}
              </div>
              <div className="text-xs text-muted-foreground">
                IPs Suspeitos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {metrics.totalViolations}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Violações
              </div>
            </div>
          </div>
          
          {metrics.lastSecurityScan && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Última varredura: {metrics.lastSecurityScan.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Segurança ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                variant={getAlertVariant(alert.type)}
                className="relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        <Badge variant={getAlertVariant(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                        {alert.action && (
                          <div className="text-xs mt-1 font-medium">
                            Ação recomendada: {alert.action}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* IPs Suspeitos */}
      {metrics.suspiciousIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              IPs Suspeitos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.suspiciousIPs.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">{ip}</code>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implementar bloqueio de IP
                      console.log(`Bloqueando IP: ${ip}`);
                    }}
                  >
                    Bloquear
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Saudável */}
      {alerts.length === 0 && metrics.recentViolations === 0 && (
        <Alert>
          <Shield className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Sistema Seguro</AlertTitle>
          <AlertDescription>
            Nenhuma atividade suspeita detectada nas últimas 24 horas.
            Monitoramento ativo desde {metrics.lastSecurityScan?.toLocaleString()}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}